import core from "@actions/core"

import { run } from "./run.js"

( async () => {
    try {
        run()
    } catch (error) {
        core.setFailed(error.message)
    }
} )();
