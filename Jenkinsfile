pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        FRONTEND_DIR       = '/var/www/three-tier/frontend'
        BACKEND_DEPLOY_DIR = '/var/lib/jenkins/backend-deploy'
        DB_NAME            = 'three_tier_db'
        DB_USER            = 'three_tier_user'
        BACKEND_PORT       = '5000'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Validate Project Files') {
            steps {
                sh '''
                    set -eu

                    test -f Jenkinsfile
                    test -f database/init.sql
                    test -f backend/server.js
                    test -f backend/package.json
                    test -f frontend/index.html

                    echo 'Project files validated.'
                '''
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                echo 'Installing backend dependencies...'

                dir('backend') {
                    sh '''
                        set -eu
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
        set -eu
        export MYSQL_PWD="$DB_PASSWORD"
        mysql --user="$DB_USER" "$DB_NAME" < database/init.sql
        unset MYSQL_PWD
    '''
}
                }
            }
        }

        stage('Deploy Backend') {
            steps {
                echo 'Deploying backend...'

                sh '''
                    set -eu

                    mkdir -p "$BACKEND_DEPLOY_DIR"

                    cp -r backend/. "$BACKEND_DEPLOY_DIR/"

                    cd "$BACKEND_DEPLOY_DIR"

                    npm install --omit=dev

                    if pm2 describe three-tier-backend >/dev/null 2>&1; then
                        pm2 delete three-tier-backend
                    fi

                    pm2 start server.js \
                        --name three-tier-backend

                    pm2 save

                    pm2 status
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                echo 'Deploying frontend...'

                sh '''
                    set -eu

                    test -f frontend/index.html
                    mkdir -p "$FRONTEND_DIR"

                    cp -r frontend/. "$FRONTEND_DIR/"

                    echo 'Frontend deployment successful.'
                    ls -la "$FRONTEND_DIR"
                '''
            }
        }

        stage('Validate and Reload Nginx') {
            steps {
                echo 'Validating Nginx...'

                sh '''
                    set -eu

                    sudo nginx -t
                    sudo systemctl reload nginx

                    echo 'Nginx reload successful.'
                '''
            }
        }

        stage('Application Health Check') {
            steps {
                echo 'Checking deployed application...'

                sh '''
                    set -eu

                    sleep 5

                    echo 'Checking backend health...'

                    curl --fail --show-error --max-time 10 \
                        "http://127.0.0.1:${BACKEND_PORT}/api/health"

                    echo
                    echo 'Checking frontend...'

                    curl --fail --show-error --max-time 10 \
                        http://127.0.0.1/

                    echo
                    echo 'Checking users API...'

                    curl --fail --show-error --max-time 10 \
                        http://127.0.0.1/api/users

                    echo
                    echo 'All health checks passed.'
                '''
            }
        }
    }

    post {
        success {
            echo 'THREE-TIER DEPLOYMENT SUCCESSFUL'
        }

        failure {
            echo 'THREE-TIER DEPLOYMENT FAILED. Check Console Output.'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
