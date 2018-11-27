#!/usr/bin/env groovy

// Global Environment variables
FAILURE_EMAIL = "build@geographica.gs"
DESIRED_REPOSITORY = "https://github.com/GeographicaGS/urbo-pgsql-connector.git"

pipeline{
  agent { node {
    label 'master'
  } }

  stages {
    stage('Preparing for build') {
      // agent{ docker{
      //     image 'debian'
      // } }
      agent { node {
        label 'master'
      } }
      steps {
        prepareBuild()
      }
    }

    stage ('Building') {
      agent { node {
        label 'docker'
      } }
      steps {
        dir("./api") {
          sh "docker build --pull=true -f Dockerfile.new -t geographica/urbo-pgsql-connector:${git_commit} ."
        }
      }
    }

    // stage ('Testing') {
    //   agent { node {
    //     label 'docker'
    //   } }
    //   steps {
    //     echo "Docker network"
    //     sh "docker network create connector-network"

    //     echo "Creating database"
    //     sh "docker run -d --name urbo_pgsql--${build_name} --net=connector-network --net-alias=postgis -v ${workspace}/db:/connector_db -e \"LOCALE=es_ES\" -e \"CREATE_USER=urbo_admin;urbo\" geographica/postgis:awkward_aardvark"

    //     sleep 10
    //     echo "Populating database"
    //     sh "docker exec -i urbo_pgsql--${build_name} psql -U postgres -f /connector_db/all.sql"



    //     echo "Starting up mongodb"
    //     sh "docker run -d --name orion_mongo--${build_name} --net=connector-network --net-alias=mongo mongo:3.2 --nojournal"

    //     echo "Running orion"
    //     sh "docker run -d --name urbo_orion--${build_name} --net=connector-network --net-alias=orion fiware/orion -dbhost mongo -logLevel DEBUG"

    //     sleep 20

    //     // stage "Testing"

    //     //     echo "Testing urbo-connector/${build_name}"
    //     //     sh "docker run -i --rm --name urbo_connector--${build_name} --net=connector-network --net-alias=urbo_connector geographica/urbo_connector npm test"
    //   }
    // }

    stage('Confirm deployment') {
      agent { node {
        label 'master'
      } }
      when { anyOf {
        branch 'master';
        branch 'dev';
      } }
      steps {
        script {
          env.DEPLOY_TYPE = "old-ansible"
          if ( env.BRANCH_NAME == "master" ) {
            env.DEPLOY_TO = "production"
          } else {
            env.DEPLOY_TO = "${env.BRANCH_NAME}"
          }
        }
      }
    }
    stage ('Publish dockerfile') {
      agent { node {
        label 'docker'
      } }
      when { expression {
        env.DEPLOY_TYPE != null
      } }
      steps{
        script {
          withCredentials([[$class: 'UsernamePasswordMultiBinding',credentialsId: 'dockerhub',usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
            sh "docker login -u ${ USERNAME } -p ${ PASSWORD }"
            sh "docker tag geographica/urbo-pgsql-connector:${ git_commit } geographica/urbo-pgsql-connector:${ env.DEPLOY_TO }"
            sh "docker tag geographica/urbo-pgsql-connector:${ git_commit } geographica/urbo-pgsql-connector:${ env.DEPLOY_TO }-${ build_name }"
            sh "docker push geographica/urbo-pgsql-connector:${ env.DEPLOY_TO }"
            sh "docker push geographica/urbo-pgsql-connector:${ env.DEPLOY_TO }-${ build_name }"
          }
        }
      }
    }

    stage ('Deploying') {
      agent { node {
        label 'ansible'
      } }
      when { expression {
        env.DEPLOY_TYPE != null
      } }
      steps{
        script {
          echo "Deploy type: ${env.DEPLOY_TYPE}"
          echo "Deploy to: ${env.DEPLOY_TO}"

          if (env.DEPLOY_TYPE == "old-ansible" && ["production", "dev"].contains(env.DEPLOY_TO)) {
            echo "Deploying master ..."
            sh "ansible urbo-${env.DEPLOY_TO} -a 'sh /data/app/urbo/deploy_connectors.sh'"
          } else {
            error("Unknown DEPLOY_TYPE: '${env.DEPLOY_TYPE}-${env.DEPLOY_TO}'")
          }
        }
      }
    }
  }

  post {
    always {
      deleteDir() /* clean up our workspace */
    }
    unstable {
      notifyStatus(currentBuild.currentResult)
    }
    failure {
      notifyStatus(currentBuild.currentResult)
    }
  }
}

def prepareBuild() {
  script {
    checkout scm

    sh "git rev-parse --short HEAD > .git/git_commit"
    sh "git --no-pager show -s --format='%ae' HEAD > .git/git_committer_email"

    workspace = pwd()
    branch_name = "${ env.BRANCH_NAME }".replaceAll("/", "_")
    git_commit = readFile(".git/git_commit").replaceAll("\n", "").replaceAll("\r", "")
    build_name = "${git_commit}"
    job_name = "${ env.JOB_NAME }".replaceAll("%2F", "/")
    committer_email = readFile(".git/git_committer_email").replaceAll("\n", "").replaceAll("\r", "")
    GIT_URL = sh(returnStdout: true, script: "git config --get remote.origin.url").trim()
    if ( GIT_URL != DESIRED_REPOSITORY ) {
      error("This jenkinsfile is configured for '${ DESIRED_REPOSITORY }' but it was executed from '${ GIT_URL }'.")
    }
  }
}

def notifyStatus(buildStatus) {
  def status
  def send_to

  try {
    switch (branch_name) {
      case 'master':
        send_to = "${ committer_email }, ${ FAILURE_EMAIL }"
        break
      default:
        send_to = "${ committer_email }"
        break
    }
  } catch(Exception ex) {
    send_to = "${ FAILURE_EMAIL }"
  }

  echo "Sending error email to: ${ send_to }"
  try {
    mail  to: "${ send_to }",
          from: "Jenkins Geographica <system@geographica.gs>",
          subject: "[${ buildStatus }]   ${currentBuild.fullDisplayName}",
          body: "Something is wrong in '${currentBuild.fullDisplayName}'. \n\nSee ${env.BUILD_URL} for more details."
  } catch(Exception ex) {
    echo "Something went wrong while sending an error email :("
  }
}
