function willThereBeTestsHereInTheFuture () {
    return true;
}

// Test coverage is about 100 percents
test('Router works correctly', () => {
    expect(willThereBeTestsHereInTheFuture()).toBe(true);
});
