# =============================================
# ROTAS DA API (DJANGO REST FRAMEWORK)
# =============================================
# Define as URLs para os endpoints da API.
# Organizado por tipo de recurso:
# - Autenticação: /register/, /login/
# - Serviços: /servicos/, /servicos/<id>/
# - Usuário-Serviço: /meus-servicos/, /meus-servicos/<id>/
# =============================================

from django.urls import path
from .views import (
    api_root,
    UserRegisterView,
    UserLoginView,
    ServicoListCreateView,
    ServicoRetrieveUpdateDestroyView,
    UsuarioServicoListCreateView,
    UsuarioServicoRetrieveUpdateDestroyView
)

urlpatterns = [
    # =============================================
    # ROTA RAIZ (HEALTH CHECK)
    # =============================================
    path('', api_root, name='api-root'),

    # =============================================
    # ROTAS DE AUTENTICAÇÃO (PÚBLICAS)
    # =============================================
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),

    # =============================================
    # ROTAS DE SERVIÇOS
    # =============================================
    # - GET /servicos/: Lista todos os serviços (público para ativos, admin para todos).
    # - POST /servicos/: Cria um novo serviço (apenas admin).
    path('servicos/', ServicoListCreateView.as_view(), name='servico-list-create'),

    # - GET /servicos/<id>/: Recupera um serviço pelo ID.
    # - PUT /servicos/<id>/: Atualiza um serviço (apenas admin).
    # - DELETE /servicos/<id>/: Deleta um serviço (apenas admin).
    path('servicos/<int:pk>/', ServicoRetrieveUpdateDestroyView.as_view(), name='servico-retrieve-update-destroy'),

    # =============================================
    # ROTAS DE USUÁRIO-SERVIÇO (CLIENTES)
    # =============================================
    # - GET /meus-servicos/: Lista os serviços contratados pelo usuário logado.
    # - POST /meus-servicos/: Contrata um novo serviço (apenas o usuário logado).
    path('meus-servicos/', UsuarioServicoListCreateView.as_view(), name='usuario-servico-list-create'),

    # - GET /meus-servicos/<id>/: Recupera um serviço contratado pelo ID.
    # - PUT /meus-servicos/<id>/: Atualiza um serviço contratado (apenas o usuário logado).
    # - DELETE /meus-servicos/<id>/: Deleta um serviço contratado (apenas o usuário logado).
    path('meus-servicos/<int:pk>/', UsuarioServicoRetrieveUpdateDestroyView.as_view(), name='usuario-servico-retrieve-update-destroy'),
]