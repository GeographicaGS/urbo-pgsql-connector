##
# geographica/fiware-orion2cartodb
#
# This creates an Ubuntu derived base image that installs fiware-orion2cartodb.
#
# Ubuntu 14.04 Trusty Tahyr
FROM ubuntu:trusty

MAINTAINER Cayetano Benavent <cayetano.benavent@geographica.gs>

# Install basic dependencies
RUN apt-get update -y && apt-get install -y \
    software-properties-common \
    python-software-properties \
    python-pip
RUN pip install WebOb Paste webapp2 pyyaml

EXPOSE 3000
