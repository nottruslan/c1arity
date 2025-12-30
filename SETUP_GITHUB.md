# Настройка автоматического деплоя через GitHub

## Быстрый старт

### 1. Создайте репозиторий на GitHub

1. Откройте [GitHub](https://github.com) и войдите
2. Нажмите "+" → "New repository"
3. Название: `clarity` (или любое другое)
4. Выберите "Public" или "Private"
5. **НЕ** добавляйте README, .gitignore или лицензию (у нас уже есть)
6. Нажмите "Create repository"

### 2. Инициализируйте Git в проекте

```bash
# Перейдите в папку проекта
cd /Users/ru/Desktop/Clarity

# Инициализируйте git (если еще не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit: Clarity Telegram Mini App"

# Добавьте remote репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/clarity.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код на GitHub
git push -u origin main
```

### 3. Подключите Netlify к GitHub

1. Откройте [Netlify](https://app.netlify.com) и войдите
2. Нажмите **"Add new site"** → **"Import an existing project"**
3. Выберите **"GitHub"** и авторизуйтесь
4. Выберите ваш репозиторий `clarity`
5. Настройки сборки (должны определиться автоматически из `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Нажмите **"Deploy site"**

### 4. Получите URL

После первого деплоя Netlify предоставит URL вида:
- `https://random-name-123456.netlify.app`

Этот URL можно изменить в настройках сайта.

### 5. Настройте URL в BotFather

1. Откройте [@BotFather](https://t.me/BotFather)
2. Отправьте `/myapps`
3. Выберите ваше приложение
4. Измените URL на ваш Netlify URL

## Работа с автоматическим деплоем

Теперь при каждом изменении кода:

```bash
# Внесите изменения в код
# ...

# Добавьте изменения
git add .

# Сделайте коммит
git commit -m "Описание изменений"

# Отправьте на GitHub
git push
```

Netlify автоматически:
1. Обнаружит изменения
2. Установит зависимости
3. Соберет проект
4. Развернет новую версию

Обычно это занимает 1-2 минуты.

## Просмотр статуса деплоя

- В Netlify Dashboard вы увидите статус каждого деплоя
- Можно просматривать логи сборки
- Можно откатываться к предыдущим версиям

## Полезные команды Git

```bash
# Проверить статус
git status

# Посмотреть изменения
git diff

# Отменить изменения в файле
git checkout -- filename

# Посмотреть историю коммитов
git log

# Обновить локальную версию с GitHub
git pull
```

## Настройка кастомного домена (опционально)

В Netlify можно настроить свой домен:
1. Settings → Domain management
2. Add custom domain
3. Следуйте инструкциям

