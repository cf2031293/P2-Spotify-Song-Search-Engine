#include <iostream>
#include <chrono>
#include "SpotifyBackend.h"
using namespace std;

int main() {
    SpotifyBackend backend;

    // Load the CSV file into the backend
    if (!backend.loadCSV("spotify_dataset.csv")) {
        return 1;
    }

    cout << "Loaded " << backend.getSongCount() << " songs." << endl;

    // Test Trie artist search
    auto startTrie = chrono::high_resolution_clock::now();
    vector<Song*> artistResults = backend.searchArtist("Drake");
    auto endTrie = chrono::high_resolution_clock::now();

    auto trieTime = chrono::duration_cast<chrono::microseconds>(endTrie - startTrie);

    cout << endl;
    cout << "Trie Artist Search Results" << endl;
    cout << "Matches Found: " << artistResults.size() << endl;
    cout << "Search Time: " << trieTime.count() << " microseconds" << endl;
    backend.printSongs(artistResults, 5);

    // Test B Tree range search
    auto startBTree = chrono::high_resolution_clock::now();
    vector<Song*> energyResults = backend.searchEnergyRange(0.75, 1.0);
    auto endBTree = chrono::high_resolution_clock::now();

    auto btreeTime = chrono::duration_cast<chrono::microseconds>(endBTree - startBTree);

    cout << endl;
    cout << "B Tree Energy Range Search Results" << endl;
    cout << "Matches Found: " << energyResults.size() << endl;
    cout << "Search Time: " << btreeTime.count() << " microseconds" << endl;
    backend.printSongs(energyResults, 5);

    return 0;
}