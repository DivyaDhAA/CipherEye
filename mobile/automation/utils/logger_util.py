import logging
import os
import sys

def get_logger(name="AppiumE2E"):
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s')

        # Console Handler
        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(formatter)
        logger.addHandler(ch)

        # File Handler
        log_dir = os.path.abspath("automation/logs")
        os.makedirs(log_dir, exist_ok=True)
        fh = logging.FileHandler(os.path.join(log_dir, "appium_execution.log"), mode='a')
        fh.setFormatter(formatter)
        logger.addHandler(fh)

    return logger
