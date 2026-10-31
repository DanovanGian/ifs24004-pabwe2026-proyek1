pipeline {
    agent any

    environment {
        BUN_INSTALL = "/var/jenkins_home/.bun"
        PATH = "$BUN_INSTALL/bin:$PATH"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'rm -rf node_modules frontend/node_modules backend/node_modules'
                sh 'bun install --frozen-lockfile'
                sh 'cd backend && bun install --frozen-lockfile'
                sh 'cd frontend && bun install --frozen-lockfile'
            }
        }

        stage('Run Automated Tests & Coverage') {
            steps {
                // Menjalankan test dan membuat lcov.info untuk SonarQube
                sh 'bun run test:coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQubeServer') {
                    sh 'bunx sonar-scanner'
                }
            }
        }
    }
}
