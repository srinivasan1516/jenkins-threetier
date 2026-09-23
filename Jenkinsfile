pipeline {

    agent any

    environment {
        APP_DIR = '/var/lib/jenkins/workspace/jenkins-three-tier'
        FRONTEND_DIR = '/var/www/three-tier/frontend'
        BACKEND_DIR = '/var/lib/jenkins/workspace/jenkins-three-tier/backend'
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

                sh '''
                    cd backend
                    npm install
                '''
            }
        }


        stage('Database Deployment') {

            steps {

                echo 'Deploying database schema...'

                sh '''
                    mysql -u three_tier_user -p'ThreeTier@123' three_tier_db < database/init.sql
                '''
            }
        }


        stage('Deploy Backend') {

            steps {

                echo 'Deploying backend...'

                sh '''
                    mkdir -p /var/lib/jenkins/backend-deploy

                    cp backend/package.json /var/lib/jenkins/backend-deploy/
                    cp backend/package-lock.json /var/lib/jenkins/backend-deploy/
                    cp backend/server.js /var/lib/jenkins/backend-deploy/

                    cd /var/lib/jenkins/backend-deploy

                    npm install --omit=dev

                    pm2 delete three-tier-backend || true

                    pm2 start server.js --name three-tier-backend

                    pm2 save
                '''
            }
        }


        stage('Deploy Frontend') {

            steps {

                echo 'Deploying frontend...'

                sh '''
                    sudo mkdir -p /var/www/three-tier/frontend

                    sudo cp frontend/index.html /var/www/three-tier/frontend/
                    sudo cp frontend/style.css /var/www/three-tier/frontend/
                    sudo cp frontend/app.js /var/www/three-tier/frontend/

                    sudo chown -R www-data:www-data /var/www/three-tier/frontend
                '''
            }
        }


        stage('Restart Nginx') {

            steps {

                echo 'Restarting Nginx...'

                sh '''
                    sudo nginx -t
                    sudo systemctl reload nginx
                '''
            }
        }


        stage('Application Health Check') {

            steps {

                echo 'Checking application health...'

                sh '''
                    sleep 5

                    curl -f http://127.0.0.1:5000/api/health

                    curl -f http://127.0.0.1/api/users
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
            echo '========================================='
        }
    }
}
