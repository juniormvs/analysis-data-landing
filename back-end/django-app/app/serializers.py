
# from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Cliente, Servico, UsuarioServico

# =============================================
# SERIALIZERS DE MODELOS (CRUD)
# =============================================

class ClienteSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Cliente.
    Usa todos os campos do modelo (fields = '__all__').
    Ideal para operações CRUD básicas.
    """
    class Meta:
        model = Cliente
        fields = '__all__'  # Inclui todos os campos do modelo Cliente

class ServicoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Servico.
    Usa todos os campos do modelo (fields = '__all__').
    Permite listar, criar, editar e deletar serviços (com permissões de admin).
    """
    class Meta:
        model = Servico
        fields = '__all__'  # Inclui todos os campos do modelo Servico

# =============================================
# SERIALIZER DE USUÁRIO-SERVIÇO (RELAÇÃO N:1)
# =============================================

class UsuarioServicoSerializer(serializers.ModelSerializer):
    # Campo para leitura: retorna o objeto Servico completo
    servico = ServicoSerializer(read_only=True)

    # Campo para escrita: recebe apenas o ID do serviço
    servico_id = serializers.IntegerField(
        write_only=True,
        required=True,
        help_text="ID do serviço a ser associado ao usuário."
    )

    class Meta:
        model = UsuarioServico
        fields = ['id', 'usuario_id', 'servico', 'servico_id', 'data_contratacao', 'data_expiracao', 'ativo']
        read_only_fields = ['id', 'usuario_id', 'data_contratacao']

    def create(self, validated_data):
        """
        Método personalizado para criar um UsuarioServico.
        - Recebe o ID do serviço via `servico_id`.
        - Associa o serviço ao usuário (definido na view).
        """
        # Obtém o serviço pelo ID
        servico = Servico.objects.get(id=validated_data.pop('servico_id'))

        # Cria o UsuarioServico com o serviço e o usuário (definido na view)
        usuario_servico = UsuarioServico.objects.create(
            servico=servico,
            **validated_data
        )
        return usuario_servico



# =============================================
# SERIALIZERS DE AUTENTICAÇÃO (REGISTRO E LOGIN)
# =============================================

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de novos usuários.
    - Valida se as senhas coincidem (password vs password2).
    - Cria o usuário com email como username (para autenticação).
    - Campos obrigatórios: first_name, last_name, email, password, password2.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Senha do usuário (mínimo 8 caracteres)."
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text="Confirmação da senha."
    )
    first_name = serializers.CharField(
        required=True,
        help_text="Primeiro nome do usuário."
    )
    last_name = serializers.CharField(
        required=True,
        help_text="Sobrenome do usuário."
    )

    class Meta:
        model = User  # Usa o modelo padrão do Django
        fields = ('first_name', 'last_name', 'email', 'password', 'password2')
        extra_kwargs = {
            'email': {
                'required': True,
                'help_text': 'Email do usuário (usado como username).'
            },
        }

    def validate(self, attrs):
        """
        Valida se as senhas coincidem.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "As senhas não coincidem."}
            )
        return attrs

    def create(self, validated_data):
        """
        Cria um novo usuário no banco de dados.
        - Remove o campo password2 (não é necessário salvá-lo).
        - Usa o email como username (para autenticação).
        """
        validated_data.pop('password2')  # Remove o campo de confirmação
        user = User.objects.create_user(
            username=validated_data['email'],  # Email como username
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
        )
        return user

class UserLoginSerializer(serializers.Serializer):
    """
    Serializer para login de usuários.
    - Autentica o usuário pelo email (usado como username).
    - Retorna o usuário autenticado para geração do token JWT.
    """
    email = serializers.CharField(
        help_text="Email do usuário (usado como username)."
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Senha do usuário."
    )

    def validate(self, attrs):
        """
        Valida as credenciais do usuário.
        - Usa o email como username para autenticação.
        - Retorna o usuário autenticado ou levanta um erro.
        """
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Autentica pelo email (username=email)
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            if not user:
                raise serializers.ValidationError(
                    "Email ou senha incorretos."
                )
        else:
            raise serializers.ValidationError(
                "Email e senha são obrigatórios."
            )

        attrs['user'] = user  # Adiciona o usuário autenticado ao contexto
        return attrs