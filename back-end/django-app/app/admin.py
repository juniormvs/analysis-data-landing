from django.contrib import admin
from .models import Cliente, Servico, UsuarioServico

admin.site.register(Cliente)

@admin.register(Servico)
class ServicoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'preco', 'ativo', 'criado_em')
    list_filter = ('ativo',)
    search_fields = ('nome', 'descricao')

@admin.register(UsuarioServico)
class UsuarioServicoAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'servico', 'data_contratacao', 'data_expiracao', 'ativo')
    list_filter = ('ativo', 'servico')  # <-- Corrigido: Agora é uma tupla
    search_fields = ('usuario__email', 'servico__nome')
    