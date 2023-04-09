import { Concordacle, getMockPayload } from '.'

async function main() {
  let key = '390e3c688489559688b823b80b7805f11ab9f8dc1f1156d99b48de7bc4ff4a4a'

  let concordacle = new Concordacle(key)

  let response = await getMockPayload()

  console.log(response)
}

main()
