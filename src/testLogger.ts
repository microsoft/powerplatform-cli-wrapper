import logger, { register } from "./logger";

register(console);

logger.info("test");
logger.warn("test");
