pipeline {
    agent any

    environment {
        TOTAL_TESTS = '15'
        PASSED_TESTS = '0'
        FAILED_TESTS = '0'
        COMPOSE_FILE = 'docker-compose.jenkins.yml'
    }

    stages {
        stage('Fetch Automated Tests') {
            steps {
                echo 'Pulling the test scripts from GitHub...'
                sh 'rm -rf quizflow-tests-dir'
                sh 'git clone https://github.com/M-Afaq-Bhatti/quizflow-automation.git quizflow-tests-dir'
            }
        }

        stage('Stop Old Deployment') {
            steps {
                echo 'Ensuring old deployment is down before starting new one...'
                sh 'docker compose -f $COMPOSE_FILE down --remove-orphans || true'
            }
        }

        stage('Bring Deployment UP') {
            steps {
                echo 'Bringing the application online BEFORE testing...'
                sh 'docker compose -f $COMPOSE_FILE up -d --build'
                
                // CRITICAL: Give React and Node 45 seconds to fully compile and start before testing
                echo 'Waiting 45 seconds for React to compile...'
                sh 'sleep 45' 
            }
        }

        stage('Run Tests in Docker') {
            steps {
                echo 'Application is live! Running tests against it...'
                dir('quizflow-tests-dir') {
                    sh 'docker build -t quizflow-tester .'
                    
                    script {
                        def testStatus = sh(script: 'docker run --rm --network host quizflow-tester > test_output.txt 2>&1', returnStatus: true)
                        sh 'cat test_output.txt'
                        
                        env.PASSED_TESTS = sh(script: "grep -oE '[0-9]+ passed' test_output.txt | grep -oE '[0-9]+' || echo 0", returnStdout: true).trim()
                        env.FAILED_TESTS = sh(script: "grep -oE '[0-9]+ failed' test_output.txt | grep -oE '[0-9]+' || echo 0", returnStdout: true).trim()
                        
                        if (testStatus != 0) {
                            error("Selenium tests failed!")
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Sending dynamic test results via email...'
            emailext (
                subject: "Jenkins Test Results - QuizFlow: ${currentBuild.currentResult}",
                body: """Hello,

The automated Selenium test pipeline for QuizFlow has finished executing.

Total test: ${TOTAL_TESTS}
Passed: ${PASSED_TESTS}
Failed: ${FAILED_TESTS}

Final Status: ${currentBuild.currentResult}

Please find the detailed execution logs attached.""",
                recipientProviders: [
                    [$class: 'RequesterRecipientProvider'],
                    [$class: 'DevelopersRecipientProvider']
                ],
                attachLog: true
            )
        }
        success {
            echo 'Pipeline SUCCESS! App running on port 3000.'
        }
        failure {
            echo 'Pipeline FAILED. Check logs above.'
        }
    }
}