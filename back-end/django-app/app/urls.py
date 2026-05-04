from django.urls import path
from . import views
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
    path('', api_root, name='api-root'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('clientes/', views.ClienteListCreate.as_view(), name='clientes'),
    path('servicos/', ServicoListCreateView.as_view(), name='servico-list-create'),
    path('servicos/<int:pk>/', ServicoRetrieveUpdateDestroyView.as_view(), name='servico-retrieve-update-destroy'),
    path('meus-servicos/', UsuarioServicoListCreateView.as_view(), name='usuario-servico-list-create'),
    path('meus-servicos/<int:pk>/', UsuarioServicoRetrieveUpdateDestroyView.as_view(), name='usuario-servico-retrieve-update-destroy'),
]
