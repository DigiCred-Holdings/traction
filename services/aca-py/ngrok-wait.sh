#!/bin/bash

# ... if you want to echo the aca-py startup command ...
# set -x

# export ACAPY_ENDPOINT=http://localhost:8030

echo "fetched end point [$ACAPY_ENDPOINT]"

echo "Starting aca-py agent ..."

exec aca-py start \
    --inbound-transport http "0.0.0.0" ${TRACTION_ACAPY_HTTP_PORT} \
    --outbound-transport http \
    --endpoint ${ACAPY_ENDPOINT} \
    --wallet-name "${TRACTION_ACAPY_WALLET_NAME}" \
    --wallet-key "${TRACTION_ACAPY_WALLET_ENCRYPTION_KEY}" \
    --wallet-storage-config "{\"url\":\"${POSTGRESQL_HOST}:5432\",\"max_connections\":5, \"wallet_scheme\":\"${TRACTION_ACAPY_WALLET_SCHEME}\"}" \
    --wallet-storage-creds "{\"account\":\"${POSTGRESQL_USER}\",\"password\":\"${POSTGRESQL_PASSWORD}\",\"admin_account\":\"${POSTGRESQL_USER}\",\"admin_password\":\"${POSTGRESQL_PASSWORD}\"}" \
    --admin "0.0.0.0" ${TRACTION_ACAPY_ADMIN_PORT} \
    --plugin multitenant_provider.v1_0 \
    --plugin traction_plugins.traction_innkeeper.v1_0 \
    --plugin basicmessage_storage.v1_0 \
    --plugin connection_update.v1_0 \
    --plugin multitenant_provider.v1_0 \
    --plugin rpc.v1_0 \
