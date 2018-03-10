// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the Apache License, Version 2.0. See License.txt in the project root for license information.

using System.IO;
using System.Linq;
using Microsoft.Extensions.Primitives;

namespace CoreXT.FileSystem
{
    public static class PathUtils
    {
        internal const string NOT_NULL_EMPTY_OR_WHITESPACE_MSG = "Cannot be null, empty, or only whitespace.";

        /// <summary> The invalid file name characters. </summary>
        public static readonly char[] InvalidFileNameChars = Path.GetInvalidFileNameChars();

        /// <summary> The invalid file name characters. </summary>
        public static readonly char[] InvalidPathChars = Path.GetInvalidFileNameChars()
            .Where(c => c != Path.DirectorySeparatorChar && c != Path.AltDirectorySeparatorChar).ToArray();

        /// <summary> The invalid glob filter characters (see <seealso cref="Microsoft.Extensions.FileSystemGlobbing.Matcher" />). </summary>
        public static readonly char[] InvalidFilterChars = InvalidPathChars
            .Where(c => c != '*' && c != '|' && c != '?').ToArray();

        /// <summary> The common forward and backward slash path separators. </summary>
        public static readonly char[] PathSeparators = new[] { Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar };

        /// <summary> Returns true if the given filename has invalid characters. </summary>
        /// <param name="filename"> A file system filename. </param>
        /// <returns> True if invalid filename characters were found, false if not. </returns>
        public static bool HasInvalidFilenameChars(string filename)
        {
            return filename.IndexOfAny(InvalidFileNameChars) != -1;
        }

        /// <summary> Returns true if the given path has invalid characters. </summary>
        /// <param name="path"> A file system path. </param>
        /// <returns> True if invalid path characters were found, false if not. </returns>
        public static bool HasInvalidPathChars(string path)
        {
            return path.IndexOfAny(InvalidPathChars) != -1;
        }

        /// <summary> Returns true  if 'path' has invalid filter characters. </summary>
        /// <param name="path"> A file system path. </param>
        /// <returns> True if invalid filter characters were found, false if not. </returns>
        public static bool HasInvalidFilterChars(string path)
        {
            return path.IndexOfAny(InvalidFilterChars) != -1;
        }

        /// <summary>
        ///     Ensures that the path ends with a trailing slash. Any whitespace at the end is removed before the slash is added.
        /// </summary>
        /// <param name="path"> A file system path. </param>
        /// <returns> A string. </returns>
        public static string EnsureTrailingSlash(string path)
        {
            path = path?.TrimEnd();
            if (!string.IsNullOrEmpty(path) &&
                path[path.Length - 1] != Path.DirectorySeparatorChar)
            {
                return path + Path.DirectorySeparatorChar;
            }
            return path;
        }

        /// <summary>
        ///     Returns true if the path contains previous directory navigations ("..") that navigate above the root of the given
        ///     path.
        /// </summary>
        /// <param name="path"> A file system path. </param>
        /// <returns> True if navigations go above the root, and false otherwise. </returns>
        public static bool PathNavigatesAboveRoot(string path)
        {
            var tokenizer = new StringTokenizer(path, PathSeparators);
            var depth = 0;

            foreach (var segment in tokenizer)
            {
                if (segment.Equals(".") || segment.Equals(""))
                {
                    continue;
                }
                else if (segment.Equals(".."))
                {
                    depth--;

                    if (depth == -1)
                    {
                        return true;
                    }
                }
                else
                {
                    depth++;
                }
            }

            return false;
        }
    }
}
