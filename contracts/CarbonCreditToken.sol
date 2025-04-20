// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import only Ownable
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CarbonCreditToken (Minimized)
 * @dev Minimal token representing verified carbon credits from the AtmoSieve system.
 * Implements essential ERC20 functions (transfer, balanceOf, totalSupply, metadata)
 * but *omits* the allowance mechanism (approve, transferFrom, allowance) to save size.
 * Credits are minted by the contract owner based on off-chain simulation data.
 * Includes the originating system identifier in the mint event.
 */
contract CarbonCreditToken is Ownable { // Removed ERC20 inheritance

    // --- State Variables ---
    mapping(address => uint256) private _balances;
    uint256 private _totalSupply;
    string private _name;
    string private _symbol;
    uint8 private _decimals; // Standard is 18

    // --- Events ---

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Event emitted when tokens are minted, including the system ID.
     * @param account The address receiving the tokens.
     * @param amount The amount of tokens minted (in base units).
     * @param systemId The identifier of the carbon capture system originating the credits.
     */
    event CarbonCreditMinted(
        address indexed account,
        uint256 amount,
        string systemId
    );

    // --- Constructor ---

    /**
     * @dev Sets the initial name, symbol, decimals, and owner.
     */
    constructor(address initialOwner) Ownable(initialOwner) {
        _name = "AtmoSieve Carbon Credit";
        _symbol = "ACC";
        _decimals = 18; // Standard ERC20 decimal places
    }

    // --- Metadata Views ---

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     */
    function decimals() public view returns (uint8) {
        return _decimals;
    }

    // --- Core ERC20 Views ---

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // --- Core ERC20 Transfer ---

    /**
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address to, uint256 amount) public virtual returns (bool) {
        address owner = _msgSender(); // Replaced msg.sender with Ownable's _msgSender()
        _transfer(owner, to, amount);
        return true;
    }

    // --- Custom Mint Function ---

    /**
     * @dev Creates `amount` tokens and assigns them to `account`,
     * increasing the total supply. Includes the system identifier.
     * Emits Transfer and CarbonCreditMinted events.
     * Only callable by the owner.
     *
     * Requirements:
     * - `account` cannot be the zero address.
     */
    function mint(address account, uint256 amount, string memory systemId) public onlyOwner {
        require(account != address(0), "Mint: mint to the zero address");
        // require(bytes(systemId).length > 0, "Mint: System ID cannot be empty"); // Optional check

        _totalSupply += amount;
        _balances[account] += amount;

        emit Transfer(address(0), account, amount); // ERC20 standard requires Transfer event on mint
        emit CarbonCreditMinted(account, amount, systemId);
    }

    // --- Internal Transfer Logic --- (Simplified from OpenZeppelin)

    /**
     * @dev Moves `amount` of tokens from `from` to `to`.
     *
     * Internal function without access restriction.
     */
    function _transfer(address from, address to, uint256 amount) internal virtual {
        require(from != address(0), "Transfer: transfer from the zero address");
        require(to != address(0), "Transfer: transfer to the zero address");

        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "Transfer: transfer amount exceeds balance");
        unchecked {
            _balances[from] = fromBalance - amount;
            // Overflow not possible: the sum of all balances is capped by totalSupply, and the sum is preserved by
            // decrementing then incrementing.
            _balances[to] += amount;
        }

        emit Transfer(from, to, amount);
    }

     // Inherited owner() and onlyOwner modifier from Ownable
     // Inherited transferOwnership() from Ownable (if needed)
} 