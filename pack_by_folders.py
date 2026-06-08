import os

# Расширения файлов, которые нам интересны в проекте
VALID_EXTENSIONS = ('.py', '.ts', '.tsx', '.json', '.toml')

# Папка, куда скрипт будет бережно складывать готовые контексты
OUTPUT_DIR = 'copilot_context'

# Черный список директорий (системные папки, кэш, окружения)
IGNORE_DIRS = {
    'node_modules', 
    '.next', 
    '.git', 
    '__pycache__',
    'venv',
    '.venv',
    'env',
    '.env',
    'dist',
    'build',
    'migrations', # Миграции Django обычно не нужны ИИ, они только забивают контекст
    OUTPUT_DIR    # Игнорируем саму папку с результатами, чтобы не сканировать её по кругу
}

# Черный список конкретных файлов (базы данных, логи, секреты)
IGNORE_FILES = {
    'db.sqlite3',
    '.env',
    '.env.local',
    'package-lock.json', # Слишком огромные и бесполезные файлы лока
    'poetry.lock',
    'yarn.lock'
}

def collect_entire_project_context():
    print("🚀 Запуск глобального сборщика контекста для всего проекта...")
    
    base_path = '.' # Запуск из корня проекта
    
    # Создаем целевую папку для контекстов, если её нет
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"📁 Создана папка для выгрузок: /{OUTPUT_DIR}")

    # Словарь для группировки: {имя_группы: [(относительный_путь, контент)]}
    file_groups = {}

    for root, dirs, files in os.walk(base_path):
        # Исключаем скрытые папки и папки из черного списка
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
        
        # Получаем путь текущей папки относительно корня всего проекта
        rel_path_from_root = os.path.relpath(root, base_path)
        
        for file in files:
            # Проверяем расширение и исключаем файлы из черного списка
            if file.endswith(VALID_EXTENSIONS) and file not in IGNORE_FILES:
                file_path = os.path.join(root, file)
                
                # Игнорируем пустые файлы
                if os.path.getsize(file_path) == 0:
                    continue
                    
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as infile:
                        content = infile.read()
                        
                        if not content.strip():
                            continue
                            
                        # Путь, который увидит ИИ внутри файла (например: backend/core/models.py)
                        relative_path_for_ai = os.path.relpath(file_path, base_path)
                        
                        # --- УМНАЯ ДИНАМИЧЕСКАЯ ГРУППИРОВКА ---
                        if rel_path_from_root == '.':
                            # Файлы в самом корне проекта (README.md, docker-compose.yml и т.д.)
                            group_name = "project_root"
                        else:
                            parts = rel_path_from_root.split(os.sep)
                            top_folder = parts[0] # backend, frontend, infra и т.д.
                            
                            if len(parts) == 1:
                                # Файл в корне главной папки (например, backend/manage.py)
                                group_name = f"{top_folder}_root"
                            else:
                                # Файл глубер (например, backend/core/... -> backend_core)
                                # или (frontend/app/... -> frontend_app)
                                sub_folder = parts[1]
                                group_name = f"{top_folder}_{sub_folder}"
                        
                        # Добавляем в группу
                        if group_name not in file_groups:
                            file_groups[group_name] = []
                        file_groups[group_name].append((relative_path_for_ai, content))
                        
                except Exception as e:
                    print(f"   [!] Ошибка чтения файла {file_path}: {e}")

    # Запись результатов
    print("\n📦 Формирование модульных файлов контекста:")
    for group_name, files_data in file_groups.items():
        output_filename = f"context_{group_name}.txt"
        output_path = os.path.join(base_path, OUTPUT_DIR, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as outfile:
            for rel_path, content in files_data:
                outfile.write(f"\n\n{'=' * 10} START FILE: {rel_path} {'=' * 10}\n")
                outfile.write(content)
                outfile.write(f"\n{'=' * 10} END FILE: {rel_path} {'=' * 10}\n")
                
        print(f"   [+] /{OUTPUT_DIR}/{output_filename} (файлов упаковано: {len(files_data)})")

    print(f"\n✨ Идеально! Все контексты сохранены в папку /{OUTPUT_DIR}/")
    print("Перетаскивай их точечно в веб-чат Copilot Pro в зависимости от текущей задачи.")

if __name__ == '__main__':
    collect_entire_project_context()