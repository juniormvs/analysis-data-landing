# =============================================
# SERIALIZERS DO DJANGO REST FRAMEWORK
# =============================================
# Define como os dados são serializados/deserializados para a API.
# Cada serializer corresponde a um modelo e define:
# - Quais campos são incluídos nas respostas (GET).
# - Quais campos são obrigatórios nas requisições (POST/PUT).
# - Validações personalizadas.
# =============================================

from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Servico, UsuarioServico

# =============================================
# SERIALIZERS DE MODELOS (CRUD)
# =============================================

class ServicoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Servico.
    ---
    # Campos serializados:
    - id: ID do serviço (somente leitura).
    - nome: Nome do serviço.
    - descricao: Descrição do serviço.
    - preco: Preço do serviço (formato: R$ 00.00).
    - ativo: Indica se o serviço está ativo.
    ---
    # Uso:
    - Listar serviços (GET /api/servicos/).
    - Criar/atualizar serviços (POST/PUT /api/servicos/).
    """
    class Meta:
        model = Servico
        fields = ['id', 'nome', 'descricao', 'preco', 'ativo']
        read_only_fields = ['id']  # ID é gerado automaticamente

# =============================================
# SERIALIZER DE USUÁRIO-SERVIÇO (RELAÇÃO N:M)
# =============================================

class UsuarioServicoSerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo UsuarioServico.
    ---
    # Campos serializados:
    - id: ID do relacionamento (somente leitura).
    - usuario_id: ID do usuário (somente leitura, definido automaticamente).
    - servico: Objeto Servico completo (somente leitura, aninhado).
    - servico_id: ID do serviço (somente escrita, usado para contratar).
    - data_contratacao: Data de contratação (somente leitura).
    - ativo: Indica se o serviço está ativo para o usuário.
    ---
    # Regras:
    - Ao criar (POST), recebe apenas `servico_id`.
    - Ao listar (GET), retorna o objeto `servico` completo.
    """
    # Campo para leitura: retorna o objeto Servico completo (aninhado)
    servico = ServicoSerializer(read_only=True)

    # Campo para escrita: recebe apenas o ID do serviço
    servico_id = serializers.IntegerField(
        write_only=True,
        required=True,
        help_text="ID do serviço a ser contratado."
    )

    class Meta:
        model = UsuarioServico
        fields = ['id', 'usuario_id', 'servico', 'servico_id', 'data_contratacao', 'ativo']
        read_only_fields = ['id', 'usuario_id', 'data_contratacao', 'servico']

    def create(self, validated_data):
        """
        Método personalizado para criar um UsuarioServico.
        ---
        # Fluxo:
        1. Obtém o serviço pelo ID (`servico_id`).
        2. Cria o relacionamento entre o usuário (definido na view) e o serviço.
        3. Retorna o objeto criado.
        """
        servico = Servico.objects.get(id=validated_data.pop('servico_id'))
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
    ---
    # Campos:
    - first_name: Primeiro nome (obrigatório).
    - last_name: Sobrenome (obrigatório).
    - email: Email do usuário (obrigatório, usado como username).
    - password: Senha (obrigatório, mínimo 8 caracteres).
    - password2: Confirmação da senha (obrigatório, deve ser igual a password).
    ---
    # Validações:
    - Verifica se as senhas coincidem.
    - Cria o usuário com o email como username.
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
        help_text="Confirmação da senha (deve ser igual à senha)."
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
        model = User
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
        ---
        # Regras:
        - `password` e `password2` devem ser iguais.
        - Se não forem, levanta um erro de validação.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "As senhas não coincidem."}
            )
        return attrs

    def create(self, validated_data):
        """
        Cria um novo usuário no banco de dados.
        ---
        # Fluxo:
        1. Remove o campo `password2` (não é necessário salvá-lo).
        2. Usa o email como username (para autenticação).
        3. Cria o usuário com os dados validados.
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
    ---
    # Campos:
    - email: Email do usuário (usado como username).
    - password: Senha do usuário.
    ---
    # Validações:
    - Autentica o usuário pelo email (username=email).
    - Retorna o usuário autenticado ou levanta um erro.
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
        ---
        # Fluxo:
        1. Obtém email e senha da requisição.
        2. Autentica o usuário pelo email (username=email).
        3. Se o usuário não for encontrado, levanta um erro.
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