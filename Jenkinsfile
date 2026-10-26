pipeline {
    agent any

    environment {
        FRONTEND_DIR = '/var/www/three-tier/frontend'
        BACKEND_DEPLOY_DIR = '/var/lib/jenkins/backend-deploy'
        DB_NAME = 'three_tier_db'
        DB_USER = 'three_tier_user'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo 'Installing backend dependencies...'
                dir('backend') {
                    sh '''
                        set -e
                        npm install
                    '''
                }
            }
        }

        stage('Database Deployment') {
            steps {
                echo 'Deploying database schema...'

                withCredentials([
                    string(
                        credentialsId: 'three-tier-db-password',
                        variable: 'DB_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -e
                        MYSQL_PWD="$DB_PASSWORD" mysql \
                            -u "$DB_USER" "$DB_NAME" \
                            < database/init.sql
                    '''
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                echo 'Deploying backend...'
                sh '''
                    set -e

                    mkdir -p "$BACKEND_DEPLOY_DIR"

                    cp backend/package.json "$BACKEND_DEPLOY_DIR/"
                    cp backend/package-lock.json "$BACKEND_DEPLOY_DIR/"
                    cp backend/server.js "$BACKEND_DEPLOY_DIR/"

                    cd "$BACKEND_DEPLOY_DIR"
                    npm install --omit=dev

                    if pm2 describe three-tier-backend >/dev/null 2>&1; then
                        pm2 delete three-tier-backend
                    fi

                    pm2 start server.js --name three-tier-backend
                    pm2 save
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                echo 'Deploying frontend...'
                sh '''
                    set -e

                    test -f frontend/index.html
                    test -f frontend/style.css
                    test -f frontend/app.js

                    mkdir -p "$FRONTEND_DIR"

                    cp frontend/index.html "$FRONTEND_DIR/"
                    cp frontend/style.css "$FRONTEND_DIR/"
                    cp frontend/app.js "$FRONTEND_DIR/"
                '''
            }
        }

        stage('Restart Nginx') {
            steps {
                echo 'Testing and reloading Nginx...'
                sh '''
                    set -e
                    sudo nginx -t
                    sudo systemctl reload nginx
                '''
            }
        }

        stage('Application Health Check') {
            steps {
                echo 'Checking application health...'
                sh '''
                    set -e
                    sleep 5

                    curl --fail --show-error http://127.0.0.1:5000/api/health
                    curl --fail --show-error http://127.0.0.1/api/users

                    echo 'Application health checks passed.'
                '''
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo 'THREE-TIER DEPLOYMENT SUCCESSFUL'
            echo '========================================='
        }

        failure {
            echo '========================================='
            echo 'THREE-TIER DEPLOYMENT FAILED'
            echo 'Check Console Output for the failed stage.'
            echo '========================================='
        }
    }
}
