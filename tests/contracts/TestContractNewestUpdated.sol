//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


contract TestContractNewestUpdated {
    // this is just a contract that has not yet been exported

    function anArr(uint[] memory first)
    public {}

    function twoArrs(uint[] memory first, uint[] memory second)
    public {}

    function addressArr(address[] memory first)
    public {}

    function nestedArr0(uint[][] memory first)
    public {}

    function nestedArr1(uint[][5] memory first)
    public {}

    function nestedArr2(uint[4][] memory first)
    public {}

    function nestedArr3(uint[3][3] memory first)
    public {}

    function nestedArr4(uint[3][3] memory first,
        string memory _bundleHash)
    public {}

    struct Person{
        string name;
        uint age;
        Addr addr;
    }

    struct Addr{
        string street;
        uint number;
        string town;
    }

    struct AddressPerson{
        string name;
        uint age;
        Addr[] addrs;
    }

    function structTest1 (
        Person[] memory people,
        bool test_bool
        )
    public {}

    function structTest2 (
        Person memory person,
        bool test_bool
        )
    public {}

    function structTest3 (
        AddressPerson memory person,
        string memory _bundleHash
        )
    public {}

    function structTest4 (
        AddressPerson[] memory persons,
        string memory _bundleHash
        )
    public {}

    function structTest5 (
        Person memory person,
        string memory _bundleHash
        )
    public {}

    function nowT()
    public {}

    function clientContainer (
        Person memory person,
        string memory _bundleHash,
        string memory _bundlePath
        )
    public {}

}