#!/bin/bash

run()
{
    docker-compose run app $*
}

build()
{
    docker-compose build
}

shell()
{
    run bash
}

install()
{
    run npm install
}

$1