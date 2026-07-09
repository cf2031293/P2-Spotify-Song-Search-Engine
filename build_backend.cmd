@echo off
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
cd /d "C:\Users\meigr\Downloads\EXE - PY - CPP - Installers Folder\GITHUB\P2-Spotify-Song-Search-Engine\Backend"
cl /EHsc /nologo /std:c++17 main.cpp SpotifyBackend.cpp Trie.cpp BTree.cpp /Fe:spotify_backend.exe
