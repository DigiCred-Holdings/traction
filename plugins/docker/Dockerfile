FROM --platform=$BUILDPLATFORM ghcr.io/openwallet-foundation/acapy-agent:py3.12-1.2.2 AS base

# Install and Configure Poetry
USER root
ENV POETRY_VERSION=1.8.3
ENV POETRY_HOME=/opt/poetry
RUN apt-get update && apt-get install -y curl && apt-get clean
RUN curl -sSL https://install.python-poetry.org | python - --version $POETRY_VERSION

ENV PATH="/opt/poetry/bin:$PATH"
RUN poetry config virtualenvs.in-project true

# Setup project
RUN mkdir traction_plugins && touch traction_plugins/__init__.py
COPY --chown=aries:aries pyproject.toml README.md ./

# copy over our local plugins code so we can build/install them
# these should come from github or some version, published location
COPY --chown=aries:aries traction_innkeeper ./traction_innkeeper

# Use pip directly to avoid poetry/virtualenv conflicts
RUN python -m venv /home/aries/.venv && \
    . /home/aries/.venv/bin/activate && \
    pip install --upgrade pip && \
    pip install acapy-agent==1.2.4 python-dateutil typing-extensions && \
    cd traction_innkeeper && pip install -e . && cd ..

# Make site packages location more accessible (for use with volumes)
RUN ln -s /home/aries/.venv/lib/python3.12/site-packages site-packages


FROM --platform=$BUILDPLATFORM ghcr.io/openwallet-foundation/acapy-agent:py3.12-1.2.2
COPY --from=base --chown=aries:aries /home/aries/.venv /home/aries/.venv
ENV PATH="/home/aries/.venv/bin:$PATH"

COPY --chown=aries:aries docker/default.yml ./
COPY --chown=aries:aries traction_innkeeper/traction_innkeeper traction_plugins/traction_innkeeper
RUN pip install git+https://github.com/openwallet-foundation/acapy-plugins@1.2.2#subdirectory=basicmessage_storage
RUN pip install git+https://github.com/openwallet-foundation/acapy-plugins@1.2.2#subdirectory=connection_update
RUN pip install git+https://github.com/openwallet-foundation/acapy-plugins@1.2.2#subdirectory=multitenant_provider
RUN pip install git+https://github.com/openwallet-foundation/acapy-plugins@1.2.2#subdirectory=rpc


ENTRYPOINT ["/bin/bash", "-c", "aca-py \"$@\"", "--"]
CMD ["start", "--arg-file", "default.yml"]
