import './eslint-node20-polyfill.mjs'
import withNuxt from './.nuxt/eslint.config.mjs'
import skmUiKit from './eslint-rules/skm-ui-kit.mjs'

export default withNuxt(
  {
    name: 'skm/ui-kit-guardrails',
    plugins: {
      'skm-ui-kit': skmUiKit,
    },
  },
  {
    name: 'skm/no-raw-nuxt-ui-outside-wrappers',
    files: ['app/**/*.{vue,ts}'],
    ignores: ['app/components/ui/**'],
    rules: {
      'skm-ui-kit/no-raw-nuxt-ui': 'error',
    },
  },
  {
    name: 'skm/no-presets-outside-ui',
    files: [
      'app/pages/**/*.{vue,ts}',
      'app/components/layout/**/*.{vue,ts}',
      'app/components/home/**/*.{vue,ts}',
      'app/layouts/**/*.{vue,ts}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/components/ui/presets',
                '**/ui/presets',
                '~/components/ui/presets',
              ],
              message:
                'Import presets only inside app/components/ui/. Use Skm* wrappers from @skm/components.',
            },
          ],
        },
      ],
    },
  },
)
