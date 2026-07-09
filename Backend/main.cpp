#include <iostream>
#include <algorithm>
#include <cctype>
#include <string>
#include <vector>
#include "SpotifyBackend.h"
using namespace std;

string toLowerCopy(string value) {
    transform(value.begin(), value.end(), value.begin(), [](unsigned char c) {
        return static_cast<char>(tolower(c));
    });
    return value;
}

string escapeJson(const string& value) {
    string escaped;
    escaped.reserve(value.size());

    for (char c : value) {
        if (c == '"') {
            escaped += "\\\"";
        } else if (c == '\\') {
            escaped += "\\\\";
        } else if (c == '\n') {
            escaped += "\\n";
        } else if (c == '\r') {
            escaped += "\\r";
        } else if (c == '\t') {
            escaped += "\\t";
        } else {
            escaped += c;
        }
    }

    return escaped;
}

bool matchesQuery(const Song& song, const string& query) {
    if (query.empty()) {
        return true;
    }

    const string lowerQuery = toLowerCopy(query);
    return toLowerCopy(song.trackName).find(lowerQuery) != string::npos ||
           toLowerCopy(song.artists).find(lowerQuery) != string::npos;
}

bool matchesFilters(const Song& song, const vector<string>& filters) {
    for (const string& filter : filters) {
        const string normalized = toLowerCopy(filter);

        if (normalized == "energy" && song.energy < 0.7) {
            return false;
        } else if (normalized == "danceability" && song.danceability < 0.7) {
            return false;
        } else if (normalized == "tempo" && song.tempo < 100) {
            return false;
        } else if (normalized == "acousticness" && song.acousticness > 0.2) {
            return false;
        }
    }

    return true;
}

int main(int argc, char* argv[]) {
    SpotifyBackend backend;

    string query;
    vector<string> filters;

    for (int i = 1; i < argc; ++i) {
        string arg = argv[i];

        if (arg == "--query" && i + 1 < argc) {
            query = argv[++i];
        } else if (arg == "--filter" && i + 1 < argc) {
            filters.push_back(argv[++i]);
        }
    }

    if (!backend.loadCSV("data/spotify_dataset.csv")) {
        return 1;
    }

    vector<Song> results;
    for (const Song& song : backend.getSongs()) {
        if (matchesQuery(song, query) && matchesFilters(song, filters)) {
            results.push_back(song);
        }
    }

    cout << "{\"success\":true,\"query\":\"" << escapeJson(query) << "\",\"results\":[";
    for (size_t i = 0; i < results.size(); ++i) {
        const Song& song = results[i];
        cout << "{\"title\":\"" << escapeJson(song.trackName) << "\",\"artist\":\""
             << escapeJson(song.artists) << "\",\"tempo\":" << song.tempo
             << ",\"energy\":" << song.energy
             << ",\"danceability\":" << song.danceability
             << ",\"acousticness\":" << song.acousticness
             << ",\"popularity\":" << song.popularity << "}";

        if (i + 1 < results.size()) {
            cout << ',';
        }
    }
    cout << "]}" << endl;

    return 0;
}