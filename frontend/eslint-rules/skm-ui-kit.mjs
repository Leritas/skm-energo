/**
 * Forbid raw Nuxt UI components outside SKM wrappers.
 * Allowlist: primitives without Skm* wrappers yet (UIcon, USlideover, …).
 */

const FORBIDDEN = new Set([
  'UButton',
  'UInput',
  'UTextarea',
  'UFormField',
  'UPopover',
  'UModal',
  'UCard',
  'UContainer',
  'UBreadcrumb',
])

const SUGGEST = {
  UButton: 'SkmButton',
  UInput: 'SkmInput',
  UTextarea: 'SkmTextarea',
  UFormField: 'SkmFormField',
  UPopover: 'SkmPopover',
  UModal: 'SkmModal',
  UCard: 'SkmCard',
  UContainer: 'SkmContainer',
  UBreadcrumb: 'SkmBreadcrumbs',
}

function getTemplateVisitor(context, visitor) {
  const services =
    context.sourceCode?.parserServices ?? context.parserServices ?? null
  if (!services?.defineTemplateBodyVisitor) {
    return {}
  }
  return services.defineTemplateBodyVisitor(visitor)
}

const noRawNuxtUiRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw Nuxt UI components outside app/components/ui (use Skm* wrappers)',
    },
    schema: [],
    messages: {
      forbidden:
        'Do not use <{{name}}> outside app/components/ui/. Use <{{suggest}}> from @skm/components instead.',
    },
  },
  create(context) {
    return getTemplateVisitor(context, {
      VElement(node) {
        const name = node.rawName
        if (!FORBIDDEN.has(name)) {
          return
        }
        context.report({
          node,
          messageId: 'forbidden',
          data: {
            name,
            suggest: SUGGEST[name] ?? 'Skm*',
          },
        })
      },
    })
  },
}

export default {
  rules: {
    'no-raw-nuxt-ui': noRawNuxtUiRule,
  },
}
