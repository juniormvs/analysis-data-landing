# =============================================
# VIEWS DO DJANGO REST FRAMEWORK
# =============================================
# Define as views (endpoints) da API para:
# - Autenticação (registro e login).
# - Serviços (listar, criar, editar, deletar).
# - Usuário-Serviço (contratar, listar, gerenciar serviços do usuário).
# =============================================

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.throttling import UserRateThrottle  # Limita requisições para evitar abuso

from .models import Servico, UsuarioServico
from .serializers import (
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
    Endpoint raiz da API para verificar se o servidor está funcionando.
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
# VIEWS DE AUTENTICAÇÃO (REGISTRO E LOGIN)
# =============================================

class UserRegisterView(generics.CreateAPIView):
    """
    View para registro de novos usuários.
    ---
    # Swagger/DRF-YASG Documentation
    post:
      summary: Registra um novo usuário.
      description: |
        Cria um novo usuário com email, senha, primeiro nome e sobrenome.
        O email é usado como username para autenticação.
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
        400:
          description: Dados inválidos (ex.: senhas não coincidem).
    """
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]  # Permite acesso sem autenticação
    throttle_classes = [UserRateThrottle]  # Limita requisições para evitar abuso

    def get_serializer_context(self):
        """
        Adiciona o request ao contexto do serializer.
        ---
        # Por que?
        - O serializer pode precisar de informações do request (ex.: IP, headers).
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        """
        Cria um novo usuário e retorna os dados do usuário criado.
        ---
        # Fluxo:
        1. Valida os dados da requisição.
        2. Cria o usuário no banco de dados.
        3. Retorna os dados do usuário (sem a senha).
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
      description: |
        Autentica o usuário e retorna tokens de acesso (access) e refresh.
        O email é usado como username para autenticação.
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
                "nome": "Fulano Silva",
                "is_admin": false
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
        ---
        # Fluxo:
        1. Valida as credenciais (email e senha).
        2. Gera tokens JWT (access e refresh).
        3. Retorna os tokens e os dados do usuário (sem a senha).
        """
        serializer = UserLoginSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Gera os tokens JWT
        refresh = RefreshToken.for_user(user)
        # Adiciona o campo is_admin ao token (para uso no frontend)
        refresh['is_admin'] = user.is_admin

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "email": user.email,
                "nome": f"{user.first_name} {user.last_name}",
                "is_admin": user.is_admin,  # Inclui o campo is_admin
            },
        })

# =============================================
# VIEWS DE SERVIÇO (PÚBLICAS E ADMIN)
# =============================================

class ServicoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e criar serviços.
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Lista todos os serviços.
      description: |
        Retorna uma lista de todos os serviços **ativos** (para clientes).
        Admins veem **todos os serviços** (ativos e inativos).
      responses:
        200:
          description: Lista de serviços retornada com sucesso.
          examples:
            [
              {
                "id": 1,
                "nome": "Análise de Dados",
                "descricao": "Serviço de análise de dados avançada.",
                "preco": "100.00",
                "ativo": true
              }
            ]

    post:
      summary: Cria um novo serviço.
      description: |
        Cria um novo serviço no sistema.
        **Apenas admins podem criar serviços.**
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ServicoSerializer'
      responses:
        201:
          description: Serviço criado com sucesso.
        403:
          description: Permissão negada (apenas admins).
    """
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]  # Público para GET, autenticado para POST

    def get_queryset(self):
        """
        Filtra os serviços com base no usuário:
        - Admins: Veem todos os serviços (ativos e inativos).
        - Clientes: Veem apenas serviços ativos.
        """
        if self.request.user.is_authenticated and self.request.user.is_admin:
            return Servico.objects.all()  # Admins veem todos
        return Servico.objects.filter(ativo=True)  # Clientes veem apenas ativos

class ServicoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para recuperar, atualizar e deletar serviços.
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Recupera um serviço pelo ID.
      description: |
        Retorna os detalhes de um serviço específico.
        **Qualquer usuário pode ver um serviço ativo.**
        **Admins podem ver qualquer serviço (ativo ou inativo).**
      responses:
        200:
          description: Serviço encontrado.
        404:
          description: Serviço não encontrado.

    put:
      summary: Atualiza um serviço.
      description: **Apenas admins podem atualizar serviços.**
      responses:
        200:
          description: Serviço atualizado com sucesso.
        403:
          description: Permissão negada (apenas admins).

    delete:
      summary: Deleta um serviço.
      description: **Apenas admins podem deletar serviços.**
      responses:
        204:
          description: Serviço deletado com sucesso.
        403:
          description: Permissão negada (apenas admins).
    """
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [permissions.IsAdminUser]  # Somente admins podem editar/deletar

# =============================================
# VIEWS DE USUÁRIO-SERVIÇO (CLIENTES)
# =============================================

class UsuarioServicoListCreateView(generics.ListCreateAPIView):
    """
    View para listar e contratar serviços (apenas do usuário logado).
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Lista os serviços contratados pelo usuário.
      description: |
        Retorna uma lista dos serviços contratados pelo usuário logado.
        **Apenas o usuário logado pode ver seus próprios serviços.**
      responses:
        200:
          description: Lista de serviços do usuário.
          examples:
            [
              {
                "id": 1,
                "usuario_id": 1,
                "servico": {
                  "id": 1,
                  "nome": "Análise de Dados",
                  "descricao": "Serviço de análise de dados avançada.",
                  "preco": "100.00",
                  "ativo": true
                },
                "data_contratacao": "2026-05-19T12:00:00Z",
                "ativo": true
              }
            ]
        401:
          description: Não autorizado (token inválido ou ausente).

    post:
      summary: Contrata um novo serviço.
      description: |
        Associa um serviço ao usuário logado.
        **Apenas o ID do serviço é necessário.**
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
        401:
          description: Não autorizado (token inválido ou ausente).
    """
    serializer_class = UsuarioServicoSerializer
    permission_classes = [permissions.IsAuthenticated]  # Apenas usuários logados

    def get_queryset(self):
        """
        Retorna apenas os serviços do usuário logado.
        """
        return UsuarioServico.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        """
        Define o usuário automaticamente como o usuário logado.
        ---
        # Fluxo:
        1. O serializer já valida o `servico_id`.
        2. A view define o `usuario` como o usuário logado.
        """
        serializer.save(usuario=self.request.user)

class UsuarioServicoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    View para recuperar, atualizar e deletar serviços do usuário.
    ---
    # Swagger/DRF-YASG Documentation
    get:
      summary: Recupera um serviço contratado pelo ID.
      description: |
        Retorna os detalhes de um serviço contratado pelo usuário logado.
        **Apenas o usuário logado pode ver seus próprios serviços.**
      responses:
        200:
          description: Serviço encontrado.
        404:
          description: Serviço não encontrado ou não pertence ao usuário.

    put:
      summary: Atualiza um serviço contratado.
      description: |
        Atualiza os dados de um serviço contratado.
        **Apenas o usuário logado pode editar seus próprios serviços.**
      responses:
        200:
          description: Serviço atualizado com sucesso.
        403:
          description: Permissão negada (serviço não pertence ao usuário).

    delete:
      summary: Deleta um serviço contratado.
      description: |
        Remove um serviço contratado do usuário.
        **Apenas o usuário logado pode deletar seus próprios serviços.**
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