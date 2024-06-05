import {
  DeployArgs,
  method,
  PublicKey,
  UInt64,
  AccountUpdateForest,
  TokenContract,
  Permissions,
  Bool,
  State,
  Field,
  state,
  Poseidon,
  MerkleWitness,
} from 'o1js';

class MerkleWitness17 extends MerkleWitness(17) {}

export class MinaInu extends TokenContract {
  @state(Field) counter = State<Field>();

  async deploy(args?: DeployArgs) {
    await super.deploy(args);
    this.account.permissions.set({
      ...Permissions.default(),
      send: Permissions.proof(),
      });
    this.account.tokenSymbol.set('MINU');
    this.account.isNew.requireNothing();
    this.account.zkappUri.set('https://minainu.com')
  }

  @method async init() {
    this.account.provedState.getAndRequireEquals();
    this.account.provedState.get().assertFalse();

    super.init();
    
    this.internal.mint({ address: this.address, amount: UInt64.from(100000e9) });
  }

  @method async approveBase(forest: AccountUpdateForest) {
    this.checkZeroBalanceChange(forest);
  }

  @method async airdrop(address: PublicKey, witness: MerkleWitness17) {
    this.account.provedState.getAndRequireEquals();
    this.account.provedState.get().assertTrue();

    witness.calculateRoot(Poseidon.hash(address.toFields())).assertEquals(Field(11551030286682076905753758573143988048288396925310399358284988380085856998637n));
    const userMint = this.internal.mint({ address: address, amount: UInt64.from(30000e9) });
    userMint.account.isNew.getAndRequireEquals();
    userMint.account.isNew.requireEquals(Bool(true));
    this.internal.mint({ address: this.address, amount: UInt64.from(10000e9) });
  }

  @method async forceAirdrop(address: PublicKey) {
    this.account.provedState.getAndRequireEquals();
    this.account.provedState.get().assertTrue();

    this.internal.mint({ address: this.address, amount: UInt64.from(40000e9)})
    this.internal.send({ from: this.address, to: address, amount: UInt64.from(30000e9) })
  }
}
