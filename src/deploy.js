import { exec } from "@actions/exec"

/**
 * Deploys output directory to new branch.
 * 
 * @param {object} config project configuration
 */
export async function deploy(config) {
  await exec(`git init ${config.outputPath}`);
  await exec(`git -C ${config.outputPath} config --global user.email ${config.pusherEmail}`)
  await exec(`git -C ${config.outputPath} config --global user.name ${config.pusherName}`)
  await exec(`git -C ${config.outputPath} remote add origin ${config.repoUrl}`)
  await exec(`git -C ${config.outputPath} checkout -b ${config.repoBranch}`)
  await exec(`git -C ${config.outputPath} add -A`)
  await exec(`git -C ${config.outputPath} commit -m "[${config.actionName}] Generated blog"`)
  await exec(`git -C ${config.outputPath} push --set-upstream origin ${config.repoBranch} --force`)
}
