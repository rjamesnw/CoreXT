using CoreXT.Demos.Models;
using CoreXT.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace CoreXT.Demos.Models
{
    public partial class CoreXTDemoContext : CoreXTDBContext
    {
        internal CoreXTDemoContext(DbContextOptions<CoreXTDemoContext> options)
            : base(options) 
        {
        }

        public DbSet<Contact> Contacts { get; set; }
    }
}
