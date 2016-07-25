#!/bin/bash

# Change the domain to your SUPINBOT installation.
URL=http://localhost:8080/vpn/api/checkAccount

rawurlencode() {
	local string="${1}"
	local strlen=${#string}
	local encoded=""
	local pos c o

	for (( pos=0 ; pos<strlen ; pos++ )); do
		c=${string:$pos:1}
		case "$c" in
			[-_.~a-zA-Z0-9] ) o="${c}" ;;
			* )               printf -v o '%%%02x' "'$c"
		esac
		encoded+="${o}"
	done
	ENCODED=$encoded
}

rawurlencode $username;
encodedUsername=$ENCODED;

rawurlencode $password;
encodedPassword=$ENCODED;

responseCode=$(curl --write-out %{http_code} --silent --output /dev/null -d "username=$encodedUsername&password=$encodedPassword" $URL)

if [ "$responseCode" -eq "202" ]; then
	exit 0;
else
	exit 1;
fi;
