const renderConnectedContainer = () => {
  // If we hit this, it means the program account hasn't been initialized.
  try {
    if (addrList === null) {
      return (
        <div className="connected-container">
          <button
            className="cta-button submit-gif-button"
            onClick={createGmAccount}
          >
            Initialize program account
          </button>
        </div>
      );
    }
    // Otherwise, we're good! Account exists. User can submit GIFs.
    else {
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendAddr();
            }}
          >
            <input
              type="text"
              placeholder="Say gm!"
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>
        </div>
      );
    }
  } catch (error) {
    console.error(error);
  }
};
