pipeline {
    agent any

    environment {
        // Define variables
        DOCKER_IMAGE       = 'c0m3tz/thinkaboutBackend:latest'
        DOCKER_CREDENTIALS = credentials('docker')
        DATABASE_URL       = credentials('DATABASE_URL')
    }

    stages {
        stage('Start Jenkins') {
            steps {
                // Checkout your source code from version control
             
                    sh 'echo Start Jenkins............'
                    sh 'echo docker : user = $DOCKER_CREDENTIALS_USR : password = $DOCKER_CREDENTIALS_PSW'
            }
        }

        stage('Build Docker Image') {
            steps {
                    // Build the Docker image
                    
                    dir('./') {
                       sh 'echo "Running in $(pwd)"'
                       sh 'echo start build the Docker image = $DOCKER_IMAGE'
                       sh 'docker build --build-arg DATABASE_URL=$DATABASE_URL -t $DOCKER_IMAGE .'
                    }   
                  
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    
                    // Login to Docker Hub
                    sh 'echo $DOCKER_CREDENTIALS_PSW | docker login --username $DOCKER_CREDENTIALS_USR --password-stdin'
                    // Push the image
                    sh 'docker push $DOCKER_IMAGE'
                }
            }
        }

        stage('Clear Docker Components') {
            steps {
                script {
                    // Remove Docker images and containers
                    sh 'docker stop $(docker ps -a -q)'  
                    sh  'docker rm $(docker ps -a -q)' 
                    sh  'docker rmi $(docker images -q)'
                    sh 'docker system prune -af'
                }
            }
        }


        stage('Deploy') {
            steps {
                script {
                    // Pull the Docker image from Docker Hub
                    sh 'docker pull $DOCKER_IMAGE'
                    // Run the Docker container
                    sh 'docker run -d --name fastapi-webhook -p 8085:8080 $DOCKER_IMAGE'
                }
            }
        }
    }

    post {
        always {
            // Logout from Docker Hub
            sh 'docker logout'
        }
    }
}