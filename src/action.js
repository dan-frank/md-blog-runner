import core from "@actions/core"

import { run } from "./run.js"
import { checkFile } from "./checkFile.js"

( async () => {
    try {
        run()
        checkFile("README.md")
        checkFile("REQUIRED.md")
    } catch (error) {
        core.setFailed(error.message)
    }
} )();
