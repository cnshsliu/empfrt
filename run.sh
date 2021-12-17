cp dotEnv_dev .env
pm2 stop config.json
pm2 start config.json --watch
