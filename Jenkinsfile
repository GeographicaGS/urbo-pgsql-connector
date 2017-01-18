node("docker") {

    currentBuild.result = "SUCCESS"

    try {

        stage "Building"

            checkout scm
            // ${env.GIT_COMMIT} doesn't work D:
            sh "git rev-parse --short HEAD > .git/git_commit"
            sh "git --no-pager show -s --format='%ae' HEAD > .git/git_committer_email"

            workspace = pwd()
            branch_name = "${env.BRANCH_NAME}".replaceAll("/", "_")
            git_commit = readFile(".git/git_commit").replaceAll("\n", "").replaceAll("\r", "")
            build_name = "${branch_name}--${git_commit}"
            job_name = "${env.JOB_NAME}".replaceAll("%2F", "/")
            committer_email = readFile(".git/git_committer_email").replaceAll("\n", "").replaceAll("\r", "")

            echo "Building urbo-connector/${build_name}"

            sh "cp api/test/config.test.yml api/config.yml"
            sh "docker build --pull=true -t geographica/urbo_connector -f api/Dockerfile.test api"

            echo "Creating database"
            sh "docker run -d --name urbo_pgsql--${build_name} -v ${workspace}/db:/connector_db -e \"LOCALE=es_ES\" -e \"CREATE_USER=urbo_admin;urbo\" geographica/postgis:awkward_aardvark"

            echo "Starting up mongodb"
            sh "docker run -d --name orion_mongo--${build_name} mongo:3.2 --nojournal"

            echo "Running orion"
            sh "docker run -d --name urbo_orion--${build_name} --link orion_mongo-${build_name}:mongo -p 1026:1026 fiware/orion -dbhost mongo"

            sleep 20

        stage "Testing"

            echo "Testing urbo-connector/${build_name}"
            sh "docker run -i --rm --name urbo_connector--${build_name} --link urbo_pgsql--${build_name}:postgis --link urbo_orion--${build_name}:orion geographica/urbo_connector npm test"

    } catch (error) {

        currentBuild.result = "FAILURE"

        echo "Sending failure mail :("
        emailext subject: "${job_name} - Failure in build #${env.BUILD_NUMBER}", to: "${committer_email}, \$DEFAULT_RECIPIENTS", body: "Check console output at ${env.BUILD_URL} to view the results."

        echo "urbo-connector/${build_name} failed: ${error}"
        throw error

    } finally {

        stage "Cleaning"

            echo "Cleaning urbo-connector/${build_name}"
            sh "docker rm -f -v urbo_pgsql--${build_name}"
            sh "docker rm -f -v urbo_orion--${build_name}"


    }
}
