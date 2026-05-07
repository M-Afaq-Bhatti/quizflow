pipeline {
    agent any

    environment {
        // Initialize our test variables
        TOTAL_TESTS = '15'
        PASSED_TESTS = '0'
        FAILED_TESTS = '0'
        // Your deployment file from Assignment 2
        COMPOSE_FILE = 'docker-compose.jenkins.yml'
    }

    stages {
        stage('Fetch Automated Tests') {
            steps {
                echo 'Pulling the test scripts from the separate GitHub repository...'
                sh 'rm -rf quizflow-tests-dir'
                // Clones your specific test repository [cite: 21]
                sh 'git clone https://github.com/M-Afaq-Bhatti/quizflow-automation.git quizflow-tests-dir'
            }
        }

        stage('Run Tests in Docker') {
            steps {
                echo 'Building and executing the Dockerized test environment...'
                dir('quizflow-tests-dir') {
                    // Builds the Python environment using your Dockerfile [cite: 21]
                    sh 'docker build -t quizflow-tester .'
                    
                    script {
                        // 1. Run tests and save output to test_output.txt
                        // returnStatus: true ensures Jenkins keeps running long enough to read the file, even if tests fail!
                        def testStatus = sh(script: 'docker run --rm --network host quizflow-tester > test_output.txt 2>&1', returnStatus: true)
                        
                        // 2. Print the output to the Jenkins Console
                        sh 'cat test_output.txt'
                        
                        // 3. Extract exact numbers using Shell search commands
                        env.PASSED_TESTS = sh(script: "grep -oE '[0-9]+ passed' test_output.txt | grep -oE '[0-9]+' || echo 0", returnStdout: true).trim()
                        env.FAILED_TESTS = sh(script: "grep -oE '[0-9]+ failed' test_output.txt | grep -oE '[0-9]+' || echo 0", returnStdout: true).trim()
                        
                        // 4. Manually fail the pipeline if tests fail
                        if (testStatus != 0) {
                            error("Selenium tests failed!")
                        }
                    }
                }
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo 'Ensuring old deployment is down before starting new one...'
                sh 'docker compose -f $COMPOSE_FILE down --remove-orphans || true'
            }
        }

        stage('Bring Deployment UP') {
            steps {
                // The deployment is brought up automatically after successful tests 
                echo 'Tests passed successfully. Bringing the application online using Docker Compose...'
                sh 'docker compose -f $COMPOSE_FILE up -d --build'
                sh 'docker compose -f $COMPOSE_FILE ps'
            }
        }
    }

    post {
        always {
            echo 'Sending dynamic test results via email...'
            // Emails the test results back to the collaborator who made the push 
            emailext (
                subject: "Jenkins Test Results - QuizFlow: ${currentBuild.currentResult}",
                body: """Hello,

The automated Selenium test pipeline for QuizFlow has finished executing.

Total test: ${TOTAL_TESTS}
Passed: ${PASSED_TESTS}
Failed: ${FAILED_TESTS}

Final Status: ${currentBuild.currentResult}

Please find the detailed execution logs attached.""",
                
                // Dynamically targets the specific developer who triggered the webhook
                recipientProviders: [
                    [$class: 'RequesterRecipientProvider'],
                    [$class: 'DevelopersRecipientProvider']
                ],
                attachLog: true
            )
        }
        success {
            echo 'Pipeline SUCCESS! App running at port 3001 (frontend) and 5001 (backend)'
        }
        failure {
            echo 'Pipeline FAILED. Check logs above.'
            sh 'docker compose -f $COMPOSE_FILE logs --tail=50 || true'
        }
    }
}