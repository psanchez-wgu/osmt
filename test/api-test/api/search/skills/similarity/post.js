// let expectedData is injected from <response-type>.json

pm.test("Check similarity result", function () {
  let responseData = pm.response.json();

  pm.expect(responseData).to.have.deep.equal(expectedData);
});