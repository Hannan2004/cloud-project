pipeline {
    agent any

    environment {
        GIT_REPO = 'https://github.com/Hannan2004/cloud-project.git'
        PROJECT_ID = 'task-manager-project-457209'
        REGION = 'us-central1'

        ARTIFACT_REGISTRY = "${REGION}-docker.pkg.dev"
        REGISTRY_PATH = "${PROJECT_ID}/task-manager-repo"

        FRONTEND_IMAGE = "task-manager-frontend"
        BACKEND_IMAGE = "task-manager-backend"

        GCP_CREDENTIALS_ID = 'gcp-service-account'
        VERSION = "${env.BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install Dependencies') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            bat 'npm ci'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            bat 'npm ci'
                        }
                    }
                }
            }
        }
        stage('Build Images') {
            steps {
                withCredentials([file(credentialsId: "${GCP_CREDENTIALS_ID}", variable: 'GCP_KEY')]) {
                    powershell '''
                        $env:GOOGLE_APPLICATION_CREDENTIALS = $env:GCP_KEY
                        gcloud auth activate-service-account --key-file=$env:GCP_KEY
                        gcloud config set project $env:PROJECT_ID
                        gcloud auth configure-docker $env:ARTIFACT_REGISTRY --quiet
                    '''

                    dir('frontend') {
                        bat """
                        docker build -t %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%FRONTEND_IMAGE%:%VERSION% .
                        docker tag %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%FRONTEND_IMAGE%:%VERSION% %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%FRONTEND_IMAGE%:latest
                        """
                    }

                    dir('backend') {
                        bat """
                        docker build -t %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%BACKEND_IMAGE%:%VERSION% .
                        docker tag %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%BACKEND_IMAGE%:%VERSION% %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%BACKEND_IMAGE%:latest
                        """
                    }
                }
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([file(credentialsId: "${GCP_CREDENTIALS_ID}", variable: 'GCP_KEY')]) {
                    bat """
                    docker push %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%FRONTEND_IMAGE%:%VERSION%
                    docker push %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%FRONTEND_IMAGE%:latest
                    """

                    bat """
                    docker push %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%BACKEND_IMAGE%:%VERSION%
                    docker push %ARTIFACT_REGISTRY%/%REGISTRY_PATH%/%BACKEND_IMAGE%:latest
                    """
                }
            }
        }

        stage('Deploy to Cloud Run') {
            steps {
                withCredentials([
                    file(credentialsId: "${GCP_CREDENTIALS_ID}", variable: 'GCP_KEY'),
                    string(credentialsId: 'MONGODB_URI', variable: 'MONGODB_URI')]) {
                    powershell '''
                        $env:GOOGLE_APPLICATION_CREDENTIALS = $env:GCP_KEY

                        # Deploy frontend
                        gcloud run deploy task-manager-frontend `
                          --image=${env:ARTIFACT_REGISTRY}/${env:REGISTRY_PATH}/${env:FRONTEND_IMAGE}:${env:VERSION} `
                          --platform=managed `
                          --region=${env:REGION} `
                          --allow-unauthenticated `
                          --port=80

                        # Get frontend URL
                        $frontendUrl = gcloud run services describe task-manager-frontend --platform=managed --region=${env:REGION} --format='value(status.url)'

                        # Deploy backend with frontend URL
                        gcloud run deploy task-manager-backend `
                          --image=${env:ARTIFACT_REGISTRY}/${env:REGISTRY_PATH}/${env:BACKEND_IMAGE}:${env:VERSION} `
                          --platform=managed `
                          --region=${env:REGION} `
                          --allow-unauthenticated `
                          --set-env-vars="MONGODB_URI=${env:MONGODB_URI}" `
                          --set-env-vars="NODE_ENV=production" `
                          --set-env-vars="FRONTEND_URL=$frontendUrl"
                    '''
                }
            }
        }
    }

    post {
        always {
            powershell '''
                docker system prune -f
            '''
        }
        success {
            echo 'Pipeline successfully executed!'
        }
        failure {
            echo 'Pipeline failed! Check the logs for details.'
        }
    }
}