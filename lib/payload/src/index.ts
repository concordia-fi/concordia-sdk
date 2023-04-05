export interface AptosFunctionPayload {
  type: 'entry_function_payload'
  function: string
  arguments: any[] // matching Aptos's EntryFunctionPayload
  type_arguments: string[]
}
