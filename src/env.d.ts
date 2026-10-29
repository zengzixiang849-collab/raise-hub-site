// Extends Astro's built-in ImportMetaEnv with this project's variables.
interface ImportMetaEnv {
  /** Set to "false" only for the approved public build. Anything else = draft. */
  readonly PUBLIC_DRAFT?: string;
}
