const symbols: Array<string> = Array.from(Array(16).keys()).map((symbol) =>
  symbol.toString(16),
);

function mockTransactionIdPart(numSymbols: number): string {
  let result = '';
  for (let i = 0; i < numSymbols; i++) {
    result += symbols[(symbols.length * Math.random()) >> 0];
  }
  return result;
}

export function mockTransactionId(): string {
  return `${mockTransactionIdPart(8)}-${mockTransactionIdPart(4)}-${mockTransactionIdPart(4)}-${mockTransactionIdPart(4)}-${mockTransactionIdPart(12)}`;
}
