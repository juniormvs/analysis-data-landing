# =============================================
# MODELOS DO DJANGO (Serviços e relação com usuários)
# =============================================

from django.db import models
from django.conf import settings
from datetime import datetime


class Servico(models.Model):
    nome = models.CharField(max_length=100, verbose_name="Nome do Serviço")
    descricao = models.TextField(verbose_name="Descrição")
    preco = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço")
    criado_em = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    def __str__(self):
        return self.nome

    class Meta:
        verbose_name = "Serviço"
        verbose_name_plural = "Serviços"
        ordering = ['nome']


class UsuarioServico(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name="Usuário",
        help_text="Usuário que contratou o serviço.",
        related_name='servicos_contratados'
    )
    servico = models.ForeignKey(
        Servico,
        on_delete=models.CASCADE,
        verbose_name="Serviço",
        help_text="Serviço contratado pelo usuário.",
        related_name='usuarios_contratantes'
    )
    data_contratacao = models.DateTimeField(auto_now_add=True, verbose_name="Data de Contratação")
    data_expiracao = models.DateTimeField(null=True, blank=True, verbose_name="Data de Expiração")
    ativo = models.BooleanField(default=True, verbose_name="Ativo")

    def __str__(self):
        return f"{self.usuario.email} - {self.servico.nome}"

    class Meta:
        verbose_name = "Serviço do Usuário"
        verbose_name_plural = "Serviços dos Usuários"
        ordering = ['-data_contratacao']
        constraints = [
            models.UniqueConstraint(fields=['usuario', 'servico'], name='unique_usuario_servico')
        ]
