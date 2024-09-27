// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/access/Ownable.sol";
import "@openzeppelin/access/AccessControl.sol";
import "@openzeppelin/security/Pausable.sol";


contract ExpenseReport is Ownable, AccessControl {
    
    // Define roles
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant CONTRACTOR_ROLE = keccak256("CONTRACTOR_ROLE");

   
    // Structure for a report
    struct Report {
    string ipfsHash;
    string reportHash;         // SHA-256 hash of the report
    string metadata;           // Additional metadata
    bool approved;             // Approval status
    string rejectionReason;    // Reason for rejection, if any
    address auditedBy;         // Address of the auditor who approved the report
    uint256 projectId;         // ID of the associated project
}


    // Mappings and state variables

    mapping(uint => Report) public reports;
    mapping(address => bool) public registeredContractors; // Mapping to track registered contractors
    uint public reportCount;
    address[] public auditors; // Array to hold auditor addresses


    // Events
    event ReportSubmitted(uint indexed reportId, address indexed contractor);
    event ReportApproved(uint indexed reportId, address indexed auditor);
    event ReportRejected(uint indexed reportId, string reason, address indexed rejectedBy);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AdminRoleTransferred(address indexed previousAdmin, address indexed newAdmin);
    event AuditorAdded(address indexed user);
    event AuditorRevoked(address indexed user);


   
    // Constructor
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant the contract creator the default admin role
    }


    // Function Modifiers
    modifier onlyAuditor() {
        require(hasRole(AUDITOR_ROLE, msg.sender), "Caller is not an auditor");
        _;
    }


    // Function to transfer ownership
    function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0), "New owner is the zero address");
    require(newOwner != owner(), "New owner must be different from current owner");
    
    // Emit the event before changing ownership
    emit OwnershipTransferred(owner(), newOwner);
    
    // Call the internal function from Ownable to change the owner
    _transferOwnership(newOwner);
    }


    // Function to transfer admin role to a new address
    function transferAdminRole(address newAdmin) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(newAdmin != address(0), "New admin is the zero address");
    require(newAdmin != msg.sender, "New admin must be different from the current admin");

    // Optional: Revoke admin role from the new admin if they already have it
    if (hasRole(DEFAULT_ADMIN_ROLE, newAdmin)) {
        revokeRole(DEFAULT_ADMIN_ROLE, newAdmin);
    }

    address previousAdmin = msg.sender; // Store current admin before revoking
    revokeRole(DEFAULT_ADMIN_ROLE, previousAdmin); // Revoke from current admin
    grantRole(DEFAULT_ADMIN_ROLE, newAdmin); // Grant to new admin

    // Emit the event after the role transfer
    emit AdminRoleTransferred(previousAdmin, newAdmin);
    }


    // Function to pause the contract
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause(); // Pauses the contract
    }

    // Function to unpause the contract
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause(); // Unpauses the contract
    }

    // Function to check if the contract is paused
    function isPaused() public view returns (bool) {
        return paused(); // Returns true if the contract is paused, false otherwise
    }


     
    // Function to submit a report
    function submitReport(uint256 projectId, string memory reportHash, string memory metadata) public onlyRole(CONTRACTOR_ROLE) {
    require(projectId > 0, "Project ID must be greater than zero");
    require(bytes(reportHash).length > 0, "Report hash cannot be empty");
    require(bytes(metadata).length > 0, "Metadata cannot be empty");

    reportCount++;
    reports[reportCount] = Report(reportHash, metadata, false, "", projectId); // Include projectId here
    emit ReportSubmitted(reportCount, msg.sender); // Log the submission with report ID
    }


    
   // Function to register a contractor
    function registerContractor(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(!registeredContractors[user], "Contractor is already registered");
    registeredContractors[user] = true;
    }

    // Function to deregister a contractor
    function deregisterContractor(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(registeredContractors[user], "Contractor is not registered");
    registeredContractors[user] = false;
    }

    
    // Function to approve a report
    function approveReport(uint reportId) public onlyAuditor whenNotPaused {
    // Logic for approving an expense
    reports[reportId].approved = true;
    reports[reportId].auditedBy = msg.sender;  // Store the address of the auditor
    emit ReportApproved(reportId, msg.sender);
    }


   
    // Function to reject a report
    function rejectReport(uint reportId, string memory reason) public onlyAuditor {
    require(reportId > 0 && reportId <= reportCount, "Invalid report ID");
    
    // Update the report status and rejection reason
    reports[reportId].approved = false;
    reports[reportId].rejectionReason = reason;
    
    // Emit an event with the auditor's address
    emit ReportRejected(reportId, reason, msg.sender); // Include who rejected the report
}


    
    // Function to add an auditor role
    function addAuditor(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(!hasRole(AUDITOR_ROLE, user), "User is already an auditor");
    
    grantRole(AUDITOR_ROLE, user);
    auditors.push(user); // Add auditor to the array
    emit AuditorAdded(user);
    }

    
    // Function to revoke an auditor role
    function revokeAuditor(address user) public onlyRole(DEFAULT_ADMIN_ROLE) {
    require(hasRole(AUDITOR_ROLE, user), "User is not an auditor");

    revokeRole(AUDITOR_ROLE, user);
    
    // Remove auditor from the array
    for (uint256 i = 0; i < auditors.length; i++) {
        if (auditors[i] == user) {
            auditors[i] = auditors[auditors.length - 1]; // Replace with last element
            auditors.pop(); // Remove last element
            break;
        }
    }
    emit AuditorRevoked(user);
    }


    // Get expense details
    function getExpenseDetails(uint reportId) public view returns (string memory reportHash, string memory metadata) {
    // Return the reportHash and metadata for the given expenseId
    Report memory report = reports[reportId];
    return (report.reportHash, report.metadata);
    }

}

