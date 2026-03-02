/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates) {
  // Your code here
  const candidateList = Array.isArray(candidates) ? [...candidates] : [];
  let votes = {};
  let registered = new Map();
  let voted = new Set();

  candidateList.forEach((c) => {
    votes[c.id] = 0;
  });

  function registerVoter(voter) {
    if (
      !voter ||
      !voter.id ||
      typeof voter.age !== "number" ||
      voter.age < 18 ||
      registered.has(voter.id)
    )
      return false;

    registered.set(voter.id, { ...voter });
    return true;
  }

  function castVote(voterId, candidateId, onSuccess, onError) {
    if (typeof onSuccess !== "function" || typeof onError !== "function")
      return null;

    if (!registered.has(voterId))
      return onError("Voter not registered");

    if (!votes.hasOwnProperty(candidateId))
      return onError("Candidate not found");

    if (voted.has(voterId))
      return onError("Voter already voted");

    votes[candidateId] += 1;
    voted.add(voterId);

    return onSuccess({ voterId, candidateId });
  }

  function getResults(sortFn) {
    let results = candidateList.map((c) => ({
      id: c.id,
      name: c.name,
      party: c.party,
      votes: votes[c.id] || 0,
    }));

    if (typeof sortFn === "function") {
      return [...results].sort(sortFn);
    }

    return [...results].sort((a, b) => b.votes - a.votes);
  }

  function getWinner() {
    const results = getResults();
    if (results.length === 0 || results[0].votes === 0) return null;
    return results[0];
  }

  return {
    registerVoter,
    castVote,
    getResults,
    getWinner,
  };
}

export function createVoteValidator(rules) {
  // Your code here
  return function (voter) {
    if (!rules || typeof rules !== "object")
      return { valid: false, reason: "Invalid rules" };

    const { minAge = 0, requiredFields = [] } = rules;

    if (!voter || typeof voter !== "object")
      return { valid: false, reason: "Invalid voter" };

    for (let field of requiredFields) {
      if (!(field in voter))
        return { valid: false, reason: `Missing field ${field}` };
    }

    if (typeof voter.age !== "number" || voter.age < minAge)
      return { valid: false, reason: "Age below minimum" };

    return { valid: true, reason: null };
  };
}

export function countVotesInRegions(regionTree) {
  // Your code here
  if (
    !regionTree ||
    typeof regionTree !== "object" ||
    typeof regionTree.votes !== "number"
  )
    return 0;

  let total = regionTree.votes;

  if (Array.isArray(regionTree.subRegions)) {
    total += regionTree.subRegions.reduce(
      (sum, sub) => sum + countVotesInRegions(sub),
      0
    );
  }

  return total;
}

export function tallyPure(currentTally, candidateId) {
  // Your code here
  const tally =
    currentTally && typeof currentTally === "object"
      ? { ...currentTally }
      : {};

  tally[candidateId] = (tally[candidateId] || 0) + 1;

  return tally;
}
