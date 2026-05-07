pipeline {
    agent any

    environment {
        // Initialize our variables so they are available in the email
        TOTAL_TESTS = '15'
        PASSED_TESTS = '0'
        FAILED_TESTS = '0'
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
                        // 1. Run the tests and save the text output to test_output.txt
                        // returnStatus: true ensures Jenkins keeps running long enough to read the file, even if tests fail! [cite: 28]
                        def testStatus = sh(script: 'docker run --rm --network host quizflow-tester > test_output.txt 2>&1', returnStatus: true)
                        
                        // 2. Print the output so you can still read it in your Jenkins Console
                        sh 'cat test_output.txt'
                        
                        // 3. Extract the exact numbers using Shell search commands (grep)
                        env.PASSED_TESTS = sh(script: "grep -oE '[0-9]+ passed' test_output.txt | grep -oE '[0-9]+' || echo 0", returnStdout: true).trim()
                        env.FAILED_TESTS = sh(script: "grep -oE '[0-9]+ failed' test_output.txt | grep -oE '[0-9]+' || echo 0", returnStdout: true).trim()
                        
                        // 4. Now that we have our numbers, if the tests actually failed, we manually fail the pipeline stage
                        if (testStatus != 0) {
                            error("Selenium tests failed!")
                        }
                    }
                }
            }
        }

        stage('Bring Deployment UP') {
            steps {
                // The deployment is brought up automatically after successful tests [cite: 36]
                echo 'Tests passed successfully. Bringing the application online...'
                // IMPORTANT: Replace this echo command with the actual command you use to start your server on EC2
                sh 'echo "Starting the MERN application now!"' 
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
                
                // This targets the specific collaborator who triggered the push 
                recipientProviders: [
                    [$class: 'RequesterRecipientProvider'],
                    [$class: 'DevelopersRecipientProvider']
                ],
                attachLog: true
            )
        }
    }
}