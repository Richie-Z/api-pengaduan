@Library('homelab') _

pipeline {
  agent none
  options {
    timeout(time: 10, unit: 'MINUTES')
    disableConcurrentBuilds()
  }
  parameters {
    string(name: 'REGISTRY', description: 'Harbor registry host')
    string(name: 'HARBOR_PROJECT', description: 'Harbor project name')
    string(name: 'HARBOR_CRED_ID', description: 'Jenkins credential ID for Harbor push')
  }
  environment {
    IMAGE = "${params.REGISTRY}/${params.HARBOR_PROJECT}/api-pengaduan"
  }
  stages {
    stage('verify') {
      agent { label 'node' }
      stages {
        stage('install') {
          steps {
            container('node') {
              sh 'corepack enable && yarn install --frozen-lockfile'
            }
          }
        }
      }
    }
    stage('ci') {
      agent { label 'buildah' }
      stages {
        stage('resolve tag') {
          steps {
            script {
              env.TAG = (env.GIT_COMMIT ?: '').take(7) ?: 'latest'
            }
          }
        }
        stage('build image & push') {
          steps {
            container('buildah') {
              script {
                buildImage(
                  dockerFilePath: "./Dockerfile",
                  context: '.',
                  imageName: 'api-pengaduan',
                  tag: env.TAG,
                  registryHost: params.REGISTRY,
                  registryProject: params.HARBOR_PROJECT,
                )
              }
            }
          }
        }
      }
    }
  }
}
