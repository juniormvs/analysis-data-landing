#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import time
from django.core.management import execute_from_command_line
from django.db import connections

def wait_for_db():
    """Aguarda o banco de dados estar pronto."""
    db_conn = connections['default']
    max_retries = 30
    retry_interval = 1

    print("🔄 Aguardando o banco de dados estar pronto...")

    for _ in range(max_retries):
        try:
            db_conn.cursor()
            print("✅ Banco de dados está pronto!")
            return True
        except Exception as e:
            print(f"❌ Banco de dados não está pronto: {e}")
            time.sleep(retry_interval)

    print("❌ Não foi possível conectar ao banco de dados após várias tentativas.")
    sys.exit(1)

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Se o comando for 'wait_for_db', execute a função
    if 'wait_for_db' in sys.argv:
        wait_for_db()
        sys.exit(0)

    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()