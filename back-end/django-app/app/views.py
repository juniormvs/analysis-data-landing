from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle  # Import para limitar requisições

from .models import Cliente, Servico, UsuarioServico
from .serializers import (
    ClienteSerializer,
    UserRegisterSerializer,
    UserLoginSerializer,
    ServicoSerializer,
    UsuarioServicoSerializer
)

# =============================================
# VIEW RAIZ (HEALTH CHECK)
# =============================================

@api_view(['GET'])
def api_root(request):
    """
    Endpoint raiz da API.
    ---
    # Swagger/DRF-YASG Documentation
    responses:
      200:
        description: API está funcionando corretamente.
        examples:
          {
            "message": "API do Django funcionando!"
          }
    """
    return Response({"message": "API do Django funcionando!"})

# =============================================
# VIEWS DE CLIENTE
# =============================================

class ClienteListCreate(generics.ListCreateAPIView):
    """
    View para listar e criar clientes.
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Lista todos os clientes.
      description: Retorna uma lista de todos os clientes cadastrados.
      responses:
        200:
          description: Lista de clientes retornada com sucesso.

    post:
      summary: Cria um novo cliente.
      description: Cria um novo cliente com os dados fornecidos.
      responses:
        201:
          description: Cliente criado com sucesso.
    """
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]  # Apenas usuários autenticados

# =============================================
# VIEWS DE AUTENTICAÇÃO (REGISTRO E LOGIN)
# =============================================

class UserRegisterView(generics.CreateAPIView):
    """
    View para registro de novos usuários.
    ---
    # Swagger/DRF-YASG Documentation
    post:
      summary: Registra um novo usuário.
      description: Cria um novo usuário com email, senha, primeiro nome e sobrenome.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserRegisterSerializer'
      responses:
        201:
          description: Usuário criado com sucesso.
          examples:
            {
              "user": {
                "id": 1,
                "email": "usuario@example.com",
                "nome": "Fulano Silva"
              },
              "message": "Usuário criado com sucesso!"
            }
    """
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]  # Permite acesso sem autenticação
    throttle_classes = [UserRateThrottle]  # Limita requisições para evitar abuso

    def get_serializer_context(self):
        """
        Adiciona o request ao contexto do serializer.
        Útil para serializers que precisam de informações do request (ex.: IP, headers).
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        """
        Cria um novo usuário e retorna os dados do usuário criado.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "nome": f"{user.first_name} {user.last_name}",
            },
            "message": "Usuário criado com sucesso!",
        }, status=status.HTTP_201_CREATED)

class UserLoginView(APIView):
    """
    View para login de usuários.
    ---
    # Swagger/DRF-YASG Documentation
    post:
      summary: Faz login e retorna tokens JWT.
      description: Autentica o usuário e retorna tokens de acesso e refresh.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserLoginSerializer'
      responses:
        200:
          description: Login realizado com sucesso.
          examples:
            {
              "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              "user": {
                "id": 1,
                "email": "usuario@example.com",
                "nome": "Fulano Silva"
              }
            }
        400:
          description: Email ou senha incorretos.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [UserRateThrottle]  # Limita tentativas de login

    def get_serializer_context(self):
        """
        Adiciona o request ao contexto do serializer.
        """
        context = super().get_serializer_context() if hasattr(super(), 'get_serializer_context') else {}
        context['request'] = self.request
        return context

    def post(self, request):
        """
        Autentica o usuário e retorna tokens JWT.
        """
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "nome": f"{user.first_name} {user.last_name}",
            },
        })

# =============================================
# VIEWS DE SERVIÇO (ADMIN)
# =============================================

class ServicoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e criar serviços (apenas admin).
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Lista todos os serviços.
      description: Retorna uma lista de todos os serviços cadastrados.
      responses:
        200:
          description: Lista de serviços retornada com sucesso.

    post:
      summary: Cria um novo serviço.
      description: Cria um novo serviço (apenas admin).
      responses:
        201:
          description: Serviço criado com sucesso.
        403:
          description: Permissão negada (apenas admin).
    """
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Somente autenticado ou leitura

    def get_serializer_context(self):
        """
        Adiciona o request ao contexto do serializer.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ServicoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para recuperar, atualizar e deletar serviços (apenas admin).
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Recupera um serviço pelo ID.
      responses:
        200:
          description: Serviço encontrado.
        404:
          description: Serviço não encontrado.

    put:
      summary: Atualiza um serviço.
      responses:
        200:
          description: Serviço atualizado com sucesso.
        403:
          description: Permissão negada (apenas admin).

    delete:
      summary: Deleta um serviço.
      responses:
        204:
          description: Serviço deletado com sucesso.
        403:
          description: Permissão negada (apenas admin).
    """
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAdminUser]  # Somente admin pode editar/deletar

# =============================================
# VIEWS DE USUÁRIO-SERVIÇO (RELAÇÃO)
# =============================================

class UsuarioServicoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e contratar serviços (apenas serviços do usuário logado).
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Lista os serviços contratados pelo usuário.
      description: Retorna os serviços associados ao usuário logado.
      responses:
        200:
          description: Lista de serviços do usuário.

    post:
      summary: Contrata um novo serviço.
      description: Associa um serviço ao usuário logado. Apenas o ID do serviço é necessário.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                servico_id:
                  type: integer
                  description: ID do serviço a ser contratado.
              required:
                - servico_id
      responses:
        201:
          description: Serviço contratado com sucesso.
        400:
          description: Dados inválidos (ex.: servico_id não existe).
    """
    serializer_class = UsuarioServicoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Retorna apenas os serviços do usuário logado.
        """
        return UsuarioServico.objects.filter(usuario=self.request.user)

    def get_serializer_context(self):
        """
        Adiciona o request ao contexto do serializer.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        """
        Define o usuário automaticamente como o usuário logado.
        """
        serializer.save(usuario=self.request.user)

class UsuarioServicoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para recuperar, atualizar e deletar serviços do usuário (apenas do usuário logado).
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Recupera um serviço contratado pelo ID.
      responses:
        200:
          description: Serviço encontrado.
        404:
          description: Serviço não encontrado ou não pertence ao usuário.

    put:
      summary: Atualiza um serviço contratado.
      responses:
        200:
          description: Serviço atualizado com sucesso.
        403:
          description: Permissão negada (serviço não pertence ao usuário).

    delete:
      summary: Deleta um serviço contratado.
      responses:
        204:
          description: Serviço deletado com sucesso.
        403:
          description: Permissão negada (serviço não pertence ao usuário).
    """
    serializer_class = UsuarioServicoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Retorna apenas os serviços do usuário logado.
        """
        return UsuarioServico.objects.filter(usuario=self.request.user)