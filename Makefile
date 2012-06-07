SRC_DIR = src
TEST_DIR = test
BUILD_DIR = build
PREFIX = .

DIST_DIR = ${PREFIX}/dist

FILES =	${SRC_DIR}/core.js \
			${SRC_DIR}/props/browsers.js \
			${SRC_DIR}/props/logger.js \
			${SRC_DIR}/props/events.js \
			${SRC_DIR}/props/loader.js \
			${SRC_DIR}/props/load.js \
			${SRC_DIR}/props/check.js \
			${SRC_DIR}/props/compile1lvl.js \
			${SRC_DIR}/props/compile2lvl.js \
			${SRC_DIR}/props/checkLayer.js \
			${SRC_DIR}/props/pasteLayer.js \
			${SRC_DIR}/props/layer.js \
			${SRC_DIR}/props/external.js \
			${SRC_DIR}/props/template.js \
			${SRC_DIR}/props/links.js \
			${SRC_DIR}/props/addressBar.js \
			${SRC_DIR}/props/cache.js \
			${SRC_DIR}/props/tools.js \
			${SRC_DIR}/props/title.js \
			${SRC_DIR}/props/proptpl.js \

INFRA = ${DIST_DIR}/infra.js

all: core

test: nodeunit
	@@echo 'test complete.'

nodeunit:
	@@nodeunit ${TEST_DIR} \
		${TEST_DIR}/props/logger.js \
		${TEST_DIR}/props/events.js \
		${TEST_DIR}/props/check.js \
		${TEST_DIR}/props/compile1lvl.js \
		${TEST_DIR}/props/compile2lvl.js \
		${TEST_DIR}/props/tools.js

core: infra
	@@echo "infra.js build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

infra: ${DIST_DIR}
	@@cat ${FILES} > ${INFRA}
