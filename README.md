# Concordia SDK

This SDK contains the following:

* Client libraries for Concordia under lib/
* Example code under examples/

## Build and run

Building the SDK examples was tested with the following tools:

* yarn 1.22.19
* aptos 1.0.7

All examples use the aptos CLI wallet to submit transactions on testnet.
Before running any example make sure to create and fund a "concordia" profile on testnet.

```
aptos init --profile concordia --network testnet
```

To build and run an example go the examples/ directory then run yarn

```
cd examples
yarn
```

Now run any of the examples:

```
yarn init-profile
```
